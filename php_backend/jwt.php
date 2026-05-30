<?php
// Minimal JWT helpers (HS256)
// Composer-free; uses PHP's hash_hmac.

function base64url_encode($data) {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
  $remainder = strlen($data) % 4;
  if ($remainder) {
    $padlen = 4 - $remainder;
    $data .= str_repeat('=', $padlen);
  }
  return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_sign(array $payload, string $secret): string {
  $header = ['alg' => 'HS256', 'typ' => 'JWT'];
  $segments = [];
  $segments[] = base64url_encode(json_encode($header));
  $segments[] = base64url_encode(json_encode($payload));
  $signing_input = $segments[0] . '.' . $segments[1];
  $signature = hash_hmac('sha256', $signing_input, $secret, true);
  $segments[] = base64url_encode($signature);
  return $segments[0] . '.' . $segments[1] . '.' . $segments[2];
}

function jwt_verify(string $jwt, string $secret): ?array {
  $parts = explode('.', $jwt);
  if (count($parts) !== 3) return null;
  [$h64, $p64, $s64] = $parts;

  $header = json_decode(base64url_decode($h64), true);
  if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256') return null;

  $payload = json_decode(base64url_decode($p64), true);
  if (!is_array($payload)) return null;

  $signing_input = $h64 . '.' . $p64;
  $expected_sig = base64url_encode(hash_hmac('sha256', $signing_input, $secret, true));
  if (!hash_equals($expected_sig, $s64)) return null;

  if (isset($payload['exp']) && time() >= intval($payload['exp'])) {
    return null;
  }

  return $payload;
}

function get_bearer_token(): ?string {
  $auth = null;
  if (isset($_SERVER['Authorization'])) {
    $auth = trim($_SERVER['Authorization']);
  } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth = trim($_SERVER['HTTP_AUTHORIZATION']);
  } elseif (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
    if (isset($requestHeaders['Authorization'])) {
      $auth = trim($requestHeaders['Authorization']);
    }
  }

  if (!$auth) return null;
  if (stripos($auth, 'Bearer ') !== 0) return null;
  return trim(substr($auth, 7));
}

function jwt_get_secret(): string {
  $sec = $_ENV['JWT_SECRET'] ?? null;
  if ($sec === null || $sec === '' || $sec === false) {
    $sec = getenv('JWT_SECRET');
  }
  if ($sec === null || $sec === '' || $sec === false) {
    $sec = 'change_me_in_prod';
  }
  return $sec;
}

function require_auth(array &$outPayload, mysqli $conn): void {
  $secret = jwt_get_secret();
  $token = get_bearer_token();
  if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
  }
  $payload = jwt_verify($token, $secret);
  if (!$payload || empty($payload['sub'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    exit;
  }
  $outPayload = $payload;
}

