<?php
require 'config.php';

// Migrate existing focus sessions to xp_transactions
// Clear existing migrated entries to avoid duplicates
$conn->query("DELETE FROM xp_transactions WHERE reason IN ('Pomodoro Session', 'Rest & Recharge')");

// Migrate focus sessions (10 XP)
$sqlFocus = "INSERT INTO xp_transactions (user_id, amount, reason, created_at)
             SELECT user_id, 10, 'Pomodoro Session', started_at 
             FROM focus_sessions 
             WHERE completed = 1 AND session_type = 'focus'";
$resFocus = $conn->query($sqlFocus);
$insertedFocus = $conn->affected_rows;

// Migrate break sessions (5 XP)
$sqlBreak = "INSERT INTO xp_transactions (user_id, amount, reason, created_at)
             SELECT user_id, 5, 'Rest & Recharge', started_at 
             FROM focus_sessions 
             WHERE completed = 1 AND session_type IN ('short_break', 'long_break')";
$resBreak = $conn->query($sqlBreak);
$insertedBreak = $conn->affected_rows;

if ($resFocus && $resBreak) {
    echo "Migration successful:\n";
    echo "- Migrated $insertedFocus Pomodoro Sessions (10 XP each)\n";
    echo "- Migrated $insertedBreak Rest & Recharge Sessions (5 XP each)\n";
} else {
    echo "Error: " . $conn->error;
}
?>
