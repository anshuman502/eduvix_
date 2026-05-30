<?php
require_once __DIR__ . '/php_backend/config.php';
$res = $conn->query("SELECT * FROM attendance_records WHERE subject_id IS NULL OR subject_id = 'null'");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
?>
