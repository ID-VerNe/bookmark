<?php

// php_backend/index.php

header('Content-Type: application/json');

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/utils.php';

// 简单的错误处理
function send_error($message, $code = 400)
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit();
}

// --- 验证逻辑 ---
$auth_password = $_SERVER['HTTP_X_AUTH_PASSWORD'] ?? '';
if ($auth_password !== 'verne') {
    send_error('Unauthorized', 401);
}
// ----------------

function send_success($data = null, $code = 200)
{
    http_response_code($code);
    if ($data !== null) {
        echo json_encode($data);
    }
    exit();
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_all_data':
        $collections = get_collections();
        $bookmarks = get_bookmarks();
        send_success(['collections' => $collections, 'bookmarks' => $bookmarks]);
        break;

    case 'click_bookmark':
        $id = $_GET['id'] ?? 0;
        if (empty($id)) send_error('Bookmark ID is required.');
        increment_click_count((int)$id);
        send_success(null, 204);
        break;

    case 'add_bookmark':
        $url = $_POST['url'] ?? '';
        $title = $_POST['title'] ?? '';
        $collection_name = $_POST['collection'] ?? DEFAULT_COLLECTION;
        $new_collection = $_POST['new_collection'] ?? '';
        $custom_favicon = $_POST['favicon_path'] ?? '';

        if (empty($url)) send_error(ERROR_URL_REQUIRED);
        if (!empty($new_collection)) $collection_name = $new_collection;

        // 如果没有提供自定义图标，则尝试抓取
        if (empty($custom_favicon)) {
            $info = ['title' => '', 'favicon_path' => null];
            try {
                $info = get_webpage_info($url);
            } catch (Exception $e) {
                error_log("Bookmark creation: cURL failed for {$url}. Error: " . $e->getMessage());
            }
            $final_title = !empty($title) ? $title : ($info['title'] ?: $url);
            $final_favicon = $info['favicon_path'];
        } else {
            $final_title = !empty($title) ? $title : $url;
            $final_favicon = $custom_favicon;
        }

        try {
            add_bookmark($url, $final_title, $final_favicon, $collection_name);
            send_success(null, 204); 
        } catch (Exception $e) {
            send_error('Error saving bookmark to database: ' . $e->getMessage(), 500);
        }
        break;

    case 'edit_bookmark':
        $id = $_POST['id'] ?? 0;
        $url = $_POST['url'] ?? '';
        $title = $_POST['title'] ?? '';
        $collection_name = $_POST['collection'] ?? '';
        $custom_favicon = $_POST['favicon_path'] ?? '';

        if (empty($id) || empty($url) || empty($title) || empty($collection_name)) {
            send_error('Missing parameters for editing bookmark.');
        }
        update_bookmark((int)$id, $url, $title, $collection_name, $custom_favicon);
        send_success(null, 204);
        break;

    case 'delete_bookmark':
        $id = $_GET['id'] ?? 0;
        if (empty($id)) send_error('Bookmark ID is required.');
        delete_bookmark_by_id((int)$id);
        send_success(null, 204);
        break;

    case 'add_collection':
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        if (empty($name)) send_error('Collection name cannot be empty.');
        $pdo = get_db_connection();
        get_or_create_collection_id($pdo, $name);
        send_success(null, 204);
        break;

    case 'delete_collection':
        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        if (empty($name)) send_error('Collection name cannot be empty.');
        if ($name === DEFAULT_COLLECTION) send_error('Cannot delete the default collection.');
        delete_collection_by_name($name);
        send_success(null, 204);
        break;

    case 'upload_icon':
        $bookmark_id = $_POST['bookmark_id'] ?? 0;
        if (empty($bookmark_id)) send_error('Bookmark ID is required.');
        if (!isset($_FILES['icon']) || $_FILES['icon']['error'] !== UPLOAD_ERR_OK) {
            send_error('File upload error.');
        }
        $file = $_FILES['icon'];
        $allowed_extensions = ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowed_extensions)) send_error('Invalid file type.');
        $filename = 'custom_icon_' . $bookmark_id . '_' . time() . '.' . $extension;
        $save_path_relative = 'static/favicons/' . $filename;
        $save_path_absolute = __DIR__ . '/../' . $save_path_relative;
        if (move_uploaded_file($file['tmp_name'], $save_path_absolute)) {
            update_favicon_path((int)$bookmark_id, '/' . $save_path_relative);
            send_success(['new_path' => '/' . $save_path_relative]);
        } else {
            send_error('Failed to save uploaded file.', 500);
        }
        break;

    case 'preview_title':
        $input = json_decode(file_get_contents('php://input'), true);
        $url = $input['url'] ?? '';
        if (empty($url)) send_error('URL is required.');
        try {
            $info = get_webpage_info($url);
            send_success(['title' => $info['title']]);
        } catch (Exception $e) {
            error_log('Failed to fetch title for ' . $url . ': ' . $e->getMessage()); 
            send_success(['title' => '']);
        }
        break;

    default:
        send_error('Action not found.', 404);
        break;
}
