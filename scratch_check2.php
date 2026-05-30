<?php
require 'php_backend/config.php';
$res = $conn->query("SELECT id, title, exam_date FROM exams");
while($row = $res->fetch_assoc()) {
    echo json_encode($row) . "\n";
}
