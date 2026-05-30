<?php
require_once __DIR__ . '/php_backend/config.php';
$secret = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? 'change_me_in_prod';
echo "JWT_SECRET: " . $secret . "\n";
echo "_ENV[JWT_SECRET]: " . ($_ENV['JWT_SECRET'] ?? 'not set') . "\n";
echo "getenv(JWT_SECRET): " . (getenv('JWT_SECRET') ?? 'not set') . "\n";
?>
