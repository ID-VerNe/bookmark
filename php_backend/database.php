<?php

// php_backend/database.php

require_once __DIR__ . '/config.php';

function get_db_connection(): PDO
{
    try {
        $pdo = new PDO('sqlite:' . DATABASE_PATH);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }
}

function init_db()
{
    $pdo = get_db_connection();
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            title TEXT NOT NULL,
            favicon_path TEXT,
            collection_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP DEFAULT NULL,
            sort_order INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            FOREIGN KEY (collection_id) REFERENCES collections (id)
        );
    ");
}

function get_collections(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query('SELECT * FROM collections');
    return $stmt->fetchAll();
}

function get_bookmarks(): array
{
    $pdo = get_db_connection();
    $stmt = $pdo->query('
        SELECT b.id, b.url, b.title, b.favicon_path, b.collection_id, c.name as collection_name, b.sort_order, b.click_count
        FROM bookmarks b
        LEFT JOIN collections c ON b.collection_id = c.id
        WHERE b.deleted_at IS NULL
        ORDER BY b.click_count DESC, b.sort_order ASC, b.id ASC
    ');
    return $stmt->fetchAll();
}

function increment_click_count(int $bookmark_id): bool
{
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('UPDATE bookmarks SET click_count = click_count + 1 WHERE id = ?');
    return $stmt->execute([$bookmark_id]);
}

function get_or_create_collection_id(PDO $pdo, string $collectionName): int
{
    $stmt = $pdo->prepare('INSERT OR IGNORE INTO collections (name) VALUES (?)');
    $stmt->execute([$collectionName]);
    $stmt = $pdo->prepare('SELECT id FROM collections WHERE name = ?');
    $stmt->execute([$collectionName]);
    return $stmt->fetchColumn();
}

function add_bookmark(string $url, string $title, ?string $favicon_path, string $collection_name): bool
{
    $pdo = get_db_connection();
    $collection_id = get_or_create_collection_id($pdo, $collection_name);
    $stmt = $pdo->prepare('
        INSERT INTO bookmarks (url, title, favicon_path, collection_id)
        VALUES (?, ?, ?, ?)
    ');
    return $stmt->execute([$url, $title, $favicon_path, $collection_id]);
}

function update_bookmark(int $bookmark_id, string $url, string $title, string $collection_name, ?string $favicon_path = null): bool
{
    $pdo = get_db_connection();
    $collection_id = get_or_create_collection_id($pdo, $collection_name);

    if ($favicon_path !== null && $favicon_path !== "") {
        $stmt = $pdo->prepare('
            UPDATE bookmarks 
            SET url = ?, title = ?, collection_id = ?, favicon_path = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ');
        return $stmt->execute([$url, $title, $collection_id, $favicon_path, $bookmark_id]);
    } else {
        $stmt = $pdo->prepare('
            UPDATE bookmarks 
            SET url = ?, title = ?, collection_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ');
        return $stmt->execute([$url, $title, $collection_id, $bookmark_id]);
    }
}

function delete_bookmark_by_id(int $bookmark_id): bool
{
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('UPDATE bookmarks SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?');
    return $stmt->execute([$bookmark_id]);
}

function update_favicon_path(int $bookmark_id, string $favicon_path): bool
{
    $pdo = get_db_connection();
    $stmt = $pdo->prepare('UPDATE bookmarks SET favicon_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return $stmt->execute([$favicon_path, $bookmark_id]);
}

function delete_collection_by_name(string $collection_name): bool
{
    $pdo = get_db_connection();
    $pdo->beginTransaction();
    try {
        $collection_id = get_or_create_collection_id($pdo, $collection_name);
        $stmt = $pdo->prepare('DELETE FROM bookmarks WHERE collection_id = ?');
        $stmt->execute([$collection_id]);
        $stmt = $pdo->prepare('DELETE FROM collections WHERE id = ?');
        $stmt->execute([$collection_id]);
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        return false;
    }
}
