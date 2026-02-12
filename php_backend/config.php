<?php

// php_backend/config.php

// 数据库配置
define('DATABASE_PATH', __DIR__ . '/../bookmarks.db');

// 应用配置
define('SECRET_KEY', '2024年12月28日 16:01:44');

// 常量
define('DEFAULT_COLLECTION', '常用');
define('MAX_COLLECTIONS', 100);
define('MAX_BOOKMARKS_PER_COLLECTION', 1000);

// 错误信息
define('ERROR_URL_REQUIRED', 'URL is required');
define('ERROR_TITLE_REQUIRED', 'Title is required');
define('ERROR_COLLECTION_LIMIT', 'Maximum ' . MAX_COLLECTIONS . ' collections allowed');
define('ERROR_BOOKMARK_LIMIT', 'Maximum ' . MAX_BOOKMARKS_PER_COLLECTION . ' bookmarks per collection allowed');

// Web 抓取配置
define('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
define('REQUEST_TIMEOUT', 30);
define('DEFAULT_TITLE', 'Untitled');
define('DEFAULT_FAVICON', '/static/images/VID_20241017_1238350-1-1.jpg');

// 上下文菜单操作
define('CONTEXT_MENU_EDIT', 'Edit');
define('CONTEXT_MENU_DELETE', 'Delete');
define('CONTEXT_MENU_MOVE', 'Move to');

// 文件上传配置
// ALLOWED_EXTENSIONS 在 PHP 中通常以数组形式在逻辑中直接判断
// MAX_CONTENT_LENGTH 可以在 php.ini 中设置 (upload_max_filesize)

// 本地存储键
define('STORAGE_LAST_COLLECTION', 'lastSelectedCollection');
