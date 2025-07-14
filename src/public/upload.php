<?php
session_start();

// Yalnızca admin kullanıcılar işlem yapabilsin
if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(403);
    echo "Access denied. You must be logged in as admin.";
    exit;
}

// Sadece POST metoduna izin ver
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "Only POST method is allowed.";
    exit;
}

// Dosya kontrolü
if (!isset($_FILES['thesaurus']) || $_FILES['thesaurus']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo "File upload failed. Make sure a valid .txt file is selected.";
    exit;
}

// Dosya uzantısını kontrol et
$ext = pathinfo($_FILES['thesaurus']['name'], PATHINFO_EXTENSION);
if (strtolower($ext) !== 'txt') {
    http_response_code(400);
    echo "Only .txt files are allowed.";
    exit;
}

// Hedef dosya yolu (doğru şekilde / ile ayrılmış)
$targetPath = __DIR__ . '/thesaurus.txt';

// Dosyayı yükle ve üzerine yaz
if (move_uploaded_file($_FILES['thesaurus']['tmp_name'], $targetPath)) {
    echo "File uploaded successfully and thesaurus.txt updated.";
} else {
    http_response_code(500);
    echo "Failed to move uploaded file. Check file permissions.";
}
?>
