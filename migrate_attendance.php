<?php
require_once __DIR__ . '/php_backend/config.php';

// Add block_id column to attendance_records if it doesn't exist
$sql = "ALTER TABLE attendance_records ADD COLUMN block_id VARCHAR(36) NULL AFTER subject_id";
if ($conn->query($sql)) {
    echo "Added block_id column successfully.\n";
} else {
    echo "Error adding block_id column: " . $conn->error . "\n";
}

// Add index for faster lookup
$sql = "CREATE INDEX idx_block_date ON attendance_records (block_id, date)";
if ($conn->query($sql)) {
    echo "Added index successfully.\n";
} else {
    echo "Error adding index: " . $conn->error . "\n";
}
?>
