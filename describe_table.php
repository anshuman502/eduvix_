<?php
require_once __DIR__ . '/php_backend/config.php';
$res = $conn->query("DESCRIBE attendance_records");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
?>
