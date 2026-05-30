<?php
require 'config.php';
$res = $conn->query("SELECT * FROM focus_sessions ORDER BY started_at DESC LIMIT 5");
while($row = $res->fetch_assoc()) {
    echo "ID: " . $row['id'] . " User: " . $row['user_id'] . " Comp: " . $row['completed'] . " Type: " . $row['session_type'] . " Dur: " . $row['duration_seconds'] . "<br>";
}
?>
