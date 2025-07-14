<?php
session_start();

// Yalnızca admin kullanıcılar işlem yapabilsin
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(403);
    echo "Access denied. You must be logged in as admin.";
    exit;
}

// Sadece POST metoduna izin ver
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo "Only POST method is allowed.";
    exit;
}

// Gelen veriyi oku
$data = file_get_contents("php://input");

// Hedef dosya yolu
$filePath = __DIR__ . '/thesaurus.txt';

// Dosyayı yaz (mevcut dosyanın üzerine)
if (file_put_contents($filePath, $data) !== false) {
    echo "Saved successfully!";
} else {
    http_response_code(500);
    echo "Failed to save thesaurus.txt. Check file permissions.";
}
?>
