<?php

// php_backend/utils.php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/config.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DomCrawler\Crawler;

function get_webpage_info(string $url): array
{
    $client = new Client([
        'timeout'  => 5,
        'headers'  => ['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'],
        'verify' => false
    ]);

    try {
        $response = $client->get($url);
        $html_content = (string) $response->getBody();
        $crawler = new Crawler($html_content);

        $title = $crawler->filter('title')->first()->text('New Bookmark');
        $favicon_path = get_favicon_smart($crawler, $url, $client);

        return [
            'title' => trim($title),
            'favicon_path' => $favicon_path
        ];

    } catch (Exception $e) {
        error_log("Error fetching info for {$url}: " . $e->getMessage());
        return [
            'title' => parse_url($url, PHP_URL_HOST) ?: 'New Bookmark',
            'favicon_path' => '/static/images/default-favicon.ico'
        ];
    }
}

function get_favicon_smart(Crawler $crawler, string $original_url, Client $client): string
{
    $candidates = [];
    $base_url_parts = parse_url($original_url);
    $base_url = ($base_url_parts['scheme'] ?? 'http') . '://' . $base_url_parts['host'];

    // 1. 抓取候选图标
    $crawler->filter('link[rel*="icon"], link[rel="apple-touch-icon"]')->each(function (Crawler $node) use (&$candidates) {
        $rel = strtolower($node->attr('rel') ?: '');
        $href = $node->attr('href');
        $sizes = $node->attr('sizes') ?: '';
        
        $priority = 1;
        if (strpos($rel, 'apple-touch-icon') !== false) $priority = 10;
        if (strpos($sizes, '180') !== false || strpos($sizes, '192') !== false) $priority = 5;

        $candidates[] = ['href' => $href, 'priority' => $priority];
    });

    // 2. 排序候选者
    usort($candidates, fn($a, $b) => $b['priority'] <=> $a['priority']);
    
    // 如果没有任何候选，尝试根目录默认 favicon.ico
    if (empty($candidates)) {
        $candidates[] = ['href' => '/favicon.ico', 'priority' => 0];
    }

    foreach ($candidates as $candidate) {
        $favicon_url = $candidate['href'];
        
        // 处理相对路径
        if (!preg_match('~^https?://~i', $favicon_url)) {
            if (substr($favicon_url, 0, 2) === '//') {
                $favicon_url = ($base_url_parts['scheme'] ?? 'http') . ':' . $favicon_url;
            } elseif (substr($favicon_url, 0, 1) === '/') {
                $favicon_url = $base_url . $favicon_url;
            } else {
                $favicon_url = $base_url . '/' . $favicon_url;
            }
        }

        try {
            $res = $client->get($favicon_url);
            if ($res->getStatusCode() === 200) {
                $content = $res->getBody()->getContents();
                $mime = $res->getHeaderLine('Content-Type') ?: 'image/x-icon';
                
                // 如果是 SVG 或 极小图片，直接转 Base64 存储到数据库
                if (strlen($content) < 8000 || strpos($mime, 'svg') !== false) {
                    return 'data:' . $mime . ';base64,' . base64_encode($content);
                }

                // 否则保存为本地文件
                $filename = hash('sha256', $original_url) . '.' . pathinfo(parse_url($favicon_url, PHP_URL_PATH) ?: 'ico', PATHINFO_EXTENSION);
                $save_path = 'static/favicons/' . $filename;
                file_put_contents(__DIR__ . '/../' . $save_path, $content);
                return '/' . $save_path;
            }
        } catch (Exception $e) {
            continue;
        }
    }

    return '/static/images/default-favicon.ico';
}