<?php
require 'config.php';

function calculateUserXP_Debug($userId, $conn) {
    $xp = 0;
    // Attendance
    $stmt = $conn->prepare("SELECT status FROM attendance_records WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($r = $res->fetch_assoc()) {
        if ($r['status'] === 'attended') $xp += 10;
        else if ($r['status'] === 'missed') $xp -= 10;
    }
    // Transactions
    $stmt = $conn->prepare("SELECT SUM(amount) as total FROM xp_transactions WHERE user_id = ?");
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $xp += ($stmt->get_result()->fetch_assoc()['total'] ?? 0);
    return $xp;
}

$res = $conn->query("SELECT user_id, COUNT(*) as sessions FROM focus_sessions GROUP BY user_id ORDER BY sessions DESC LIMIT 1");
if ($row = $res->fetch_assoc()) {
    $uId = $row['user_id'];
    $xp = calculateUserXP_Debug($uId, $conn);
    echo "User ID: $uId Total XP: $xp<br>";
    
    $resTx = $conn->query("SELECT SUM(amount) as total FROM xp_transactions WHERE user_id = $uId");
    $totalTx = $resTx->fetch_assoc()['total'] ?? 0;
    echo "Transactions Total: $totalTx<br>";
} else {
    echo "No users found.";
}
?>
