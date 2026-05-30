<?php
require 'php_backend/config.php';
$conn->query("DELETE FROM exams WHERE exam_date = '0000-00-00'");
echo "Deleted corrupted exams";
