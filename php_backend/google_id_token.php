<?php

// Minimal Google ID token verification using Google public keys (JWKS).
// Verifies RS256 signature and basic claims (iss/aud/exp).
// NOTE: For production, prefer installing a tested library.

function base64url_decode($data) {
  $remainder = strlen($data) % 4;
  if ($remainder) {
    $padlen = 4 - $remainder;
    $data .= str_repeat('=', $padlen);
  }
  return base64_decode(strtr($data, '-_', '+/'));
}

function http_get_json($url): array {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 10);
  $resp = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  if ($code < 200 || $code >= 300 || !$resp) {
    throw new Exception('Failed to fetch JWKS');
  }
  $json = json_decode($resp, true);
  if (!is_array($json)) throw new Exception('Invalid JWKS response');
  return $json;
}

function google_verify_id_token(string $idToken, string $expectedAudience): array {
  $parts = explode('.', $idToken);
  if (count($parts) !== 3) throw new Exception('Invalid token format');

  [$h64, $p64, $s64] = $parts;

  $header = json_decode(base64url_decode($h64), true);
  $payload = json_decode(base64url_decode($p64), true);
  if (!is_array($header) || !is_array($payload)) throw new Exception('Invalid token');

  $kid = $header['kid'] ?? null;
  if (!$kid) throw new Exception('Missing kid');

  // Fetch keys
  $jwks = http_get_json('https://www.googleapis.com/oauth2/v3/certs');
  $keys = $jwks['keys'] ?? [];

  $key = null;
  foreach ($keys as $k) {
    if (($k['kid'] ?? null) === $kid) {
      $key = $k;
      break;
    }
  }
  if (!$key) throw new Exception('No matching JWK');

  // Google JWKS may contain x5c (certificate chain). Prefer it when available.
  // Some keys/environments might not include x5c, so fall back to JWK->PEM conversion.
  $pem = null;

  if (!empty($key['x5c'][0])) {
    $cert = $key['x5c'][0];
    $pem = "-----BEGIN CERTIFICATE-----\n" . chunk_split($cert, 64, "\n") . "\n-----END CERTIFICATE-----\n";
  } else {
    // Fallback: build a PEM public key from the RSA modulus (n) and exponent (e).
    $n = $key['n'] ?? null;
    $e = $key['e'] ?? null;
    if (empty($n) || empty($e)) {
      throw new Exception('JWKS key does not include x5c and missing n/e; cannot verify token');
    }

    $modulus = base64url_decode($n);
    $exponent = base64url_decode($e);

    // Lightweight DER builder sufficient for creating a SubjectPublicKeyInfo.
    function derLen(int $len): string {
      if ($len < 0x80) return chr($len);
      $temp = ltrim(pack('N', $len), "\x00");
      return chr(0x80 | strlen($temp)) . $temp;
    }

    function derInt(string $bin): string {
      // Ensure positive integer
      if (isset($bin[0]) && (ord($bin[0]) & 0x80) === 0x80) {
        $bin = "\x00" . $bin;
      }
      return "\x02" . derLen(strlen($bin)) . $bin;
    }

    // RSAPublicKey sequence: SEQUENCE { modulus INTEGER, exponent INTEGER }
    $rsaPublicKeySeq = "\x30" . derLen(strlen(derInt($modulus) . derInt($exponent))) . (derInt($modulus) . derInt($exponent));

    // AlgorithmIdentifier for rsaEncryption {1.2.840.113549.1.1.1} + NULL params.
    $algId = "\x30\x0d" .
      "\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x01" .
      "\x05\x00";

    // SubjectPublicKeyInfo: SEQUENCE { algId, rsaPublicKeySeq }
    $spki = "\x30" . derLen(strlen($algId . $rsaPublicKeySeq)) . ($algId . $rsaPublicKeySeq);

    $pem = "-----BEGIN PUBLIC KEY-----\n" . chunk_split(base64_encode($spki), 64, "\n") . "\n-----END PUBLIC KEY-----\n";
  }

  if (!$pem) throw new Exception('Failed to build PEM for verifying token');

  $data = $h64 . '.' . $p64;
  $signature = base64url_decode($s64);

  $verified = openssl_verify($data, $signature, $pem, OPENSSL_ALGO_SHA256);
  if ($verified !== 1) throw new Exception('Invalid token signature');

  // Claims validation
  $iss = $payload['iss'] ?? '';
  $aud = $payload['aud'] ?? '';
  $exp = intval($payload['exp'] ?? 0);
  $now = time();

  if ($iss !== 'https://accounts.google.com' && $iss !== 'accounts.google.com') {
    throw new Exception('Invalid issuer');
  }
  if ($aud !== $expectedAudience) {
    throw new Exception('Invalid audience');
  }
  if ($exp <= $now) {
    throw new Exception('Token expired');
  }

  return $payload;
}
?>


