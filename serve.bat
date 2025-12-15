@echo off
set DB_HOST=
del /Q bootstrap\cache\services.php 2>nul
del /Q bootstrap\cache\packages.php 2>nul
php artisan config:clear
php artisan optimize:clear
php artisan serve
