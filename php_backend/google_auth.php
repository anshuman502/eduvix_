<?php
require_once __DIR__ . '/google_id_token.php';

function google_login(string $idToken, mysqli $conn, string $audience): array {

  $payload = google_verify_id_token($idToken, $audience);

  $email = $payload['email'] ?? '';
  $sub = $payload['sub'] ?? '';
  if (!$email || !$sub) {
    throw new Exception('Invalid Google token claims');
  }

  // Find existing user by email
  $stmt = $conn->prepare('SELECT id, full_name, email, phone FROM users WHERE email = ? LIMIT 1');
  $stmt->bind_param('s', $email);
  $stmt->execute();
  $res = $stmt->get_result();

  if ($res->num_rows > 0) {
    $user = $res->fetch_assoc();
    return ['user' => $user, 'isNew' => false];
  }

  // Create new user. Since our UI expects password/phone too, allow nullable.
  // Ensure users table has full_name/email; phone can be empty.
  $given = $payload['given_name'] ?? '';
  $family = $payload['family_name'] ?? '';
  $name = trim($given . ' ' . $family);
  if ($name === '') $name = $payload['name'] ?? 'Google User';

  // Generate a random phone placeholder.
  $phone = 'google_' . $sub;
  $passwordHash = password_hash(bin2hex(random_bytes(16)), PASSWORD_BCRYPT);

  $insert = $conn->prepare('INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)');
  $insert->bind_param('ssss', $name, $email, $phone, $passwordHash);
  $insert->execute();

  $newId = $insert->insert_id;
  return [
    'user' => ['id' => $newId, 'full_name' => $name, 'email' => $email, 'phone' => $phone],
    'isNew' => true,
  ];
}

