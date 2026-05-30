<?php
require_once __DIR__ . '/php_backend/config.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS xp_transactions (
        id VARCHAR(64) PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        reason VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    
    "ALTER TABLE users ADD COLUMN coins INT DEFAULT 0 AFTER onboarded"
];

foreach ($queries as $sql) {
    if ($conn->query($sql)) {
        echo "Executed: " . substr($sql, 0, 50) . "...\n";
    } else {
        echo "Error: " . $conn->error . "\n";
    }
}
?>
