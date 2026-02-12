<?php
$db = new PDO('sqlite:' . __DIR__ . '/../bookmarks.db');
$db->exec("ALTER TABLE bookmarks ADD COLUMN click_count INTEGER DEFAULT 0");
echo "Database updated successfully.\n";

