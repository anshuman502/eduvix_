<?php
require_once __DIR__ . '/php_backend/config.php';
$sql = "ALTER TABLE attendance_records MODIFY COLUMN subject_id VARCHAR(64) NULL";
if ($conn->query($sql)) {
    echo "SUCCESS: subject_id is now nullable.\n";
} else {
    echo "FAILURE: " . $conn->error . "\n";
}
?>
