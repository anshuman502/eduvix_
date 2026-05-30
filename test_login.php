<?php
require_once __DIR__ . '/php_backend/config.php';
header('Content-Type: application/json');

// Check if uid column exists
$result = $conn->query("SHOW COLUMNS FROM users LIKE 'uid'");
echo json_encode([
    'uid_column_exists' => $result->num_rows > 0,
    'all_columns' => array_column($conn->query("SHOW COLUMNS FROM users")->fetch_all(MYSQLI_ASSOC), 'Field')
]);
