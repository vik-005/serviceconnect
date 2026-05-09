<?php
// Quick test script
header('Content-Type: application/json');

$_GET['SCRIPT_FILENAME'] = __FILE__;
$_GET['SCRIPT_NAME'] = '/index.php';

require __DIR__ . '/public/index.php';
