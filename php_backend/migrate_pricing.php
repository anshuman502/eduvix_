<?php
require_once __DIR__ . '/config.php';

$sql = "ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free_trial'";
if ($conn->query($sql) === TRUE) {
    echo "Column 'subscription_plan' added successfully.\n";
} else {
    echo "Error adding column: " . $conn->error . "\n";
}
$conn->close();
?>
