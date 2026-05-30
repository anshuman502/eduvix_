<?php
require_once __DIR__ . '/php_backend/config.php';

// Increase block_id column size
$sql = "ALTER TABLE attendance_records MODIFY COLUMN block_id VARCHAR(255) NULL";
if ($conn->query($sql)) {
    echo "Increased block_id column size to 255.\n";
} else {
    echo "Error modifying block_id: " . $conn->error . "\n";
}
?>
