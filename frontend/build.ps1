# build.ps1 - Automated build and packaging script

$distDir = "dist"
$rootDir = ".."

Write-Host "Starting packaging..." -ForegroundColor Cyan

# 1. Copy php_backend
Write-Host "Copying php_backend..."
if (Test-Path "$distDir/php_backend") { Remove-Item -Recurse -Force "$distDir/php_backend" }
Copy-Item -Recurse -Force "$rootDir/php_backend" "$distDir/php_backend"

# 2. Copy database
Write-Host "Copying bookmarks.db..."
Copy-Item -Force "$rootDir/bookmarks.db" "$distDir/bookmarks.db"

# 3. Copy static assets
Write-Host "Copying static assets..."
if (-not (Test-Path "$distDir/static")) { New-Item -ItemType Directory -Path "$distDir/static" }
if (Test-Path "$rootDir/static/favicons") { Copy-Item -Recurse -Force "$rootDir/static/favicons" "$distDir/static/" }
if (Test-Path "$rootDir/static/images") { Copy-Item -Recurse -Force "$rootDir/static/images" "$distDir/static/" }

Write-Host "Build finished! You can upload the 'dist' folder to your server." -ForegroundColor Green