<?php
require_once __DIR__ . '/php_backend/config.php';
$res = $conn->query("SHOW COLUMNS FROM attendance_records LIKE 'subject_id'");
$row = $res->fetch_assoc();
echo "subject_id Nullable: " . $row['Null'] . "\n";

// If it's not nullable, make it nullable
if ($row['Null'] === 'NO') {
    $conn->query("ALTER TABLE attendance_records MODIFY COLUMN subject_id VARCHAR(36) NULL");
    echo "Made subject_id nullable.\n";
}
?>
