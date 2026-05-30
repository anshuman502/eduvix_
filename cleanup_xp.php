<?php
require_once __DIR__ . '/php_backend/config.php';
$sql = "DELETE FROM attendance_records WHERE status = 'missed' AND date < CURDATE()";
if ($conn->query($sql)) {
    echo "Successfully deleted old missed records. XP should now accurately reflect recent activity.\n";
} else {
    echo "Error: " . $conn->error . "\n";
}
?>
