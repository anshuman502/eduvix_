<?php
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'getLeaderboard';
// Mock authorization token if needed
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer dummy';
require 'php_backend/api.php';
