<?php
require 'config.php';

$queries = [
    // 1. Add coins to users
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0 AFTER theme_preference",
    
    // 2. Add block_id to attendance_records and make subject_id nullable
    "ALTER TABLE attendance_records MODIFY subject_id VARCHAR(64) NULL",
    "ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS block_id VARCHAR(64) NULL AFTER subject_id",
    "ALTER TABLE attendance_records ADD INDEX IF NOT EXISTS idx_att_block (block_id)",
    
    // 3. Create xp_transactions table
    "CREATE TABLE IF NOT EXISTS xp_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      amount INT NOT NULL,
      reason VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_xp_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
    )",
    "ALTER TABLE xp_transactions ADD INDEX IF NOT EXISTS idx_xp_user (user_id)",

    // 4. Ensure habit_checkins has ON DELETE CASCADE (if supported, otherwise we just try)
    "ALTER TABLE habit_checkins DROP FOREIGN KEY fk_checkins_habit",
    "ALTER TABLE habit_checkins ADD CONSTRAINT fk_checkins_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE"
];

foreach ($queries as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Success: $sql<br>";
    } else {
        echo "Error: " . $conn->error . " for query: $sql<br>";
    }
}

echo "Database fix complete.";
