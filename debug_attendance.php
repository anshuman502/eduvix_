<?php
require_once __DIR__ . '/php_backend/config.php';
$res = $conn->query("SELECT * FROM attendance_records ORDER BY created_at DESC LIMIT 10");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
?>
