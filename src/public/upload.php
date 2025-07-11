<?php
session_start();

if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(403);
    echo "Access denied.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['thesaurus']) && $_FILES['thesaurus']['error'] === UPLOAD_ERR_OK) {
        $tmpFile = $_FILES['thesaurus']['tmp_name'];
        $targetPath = __DIR__ . 'thesaurus.txt';

        $ext = pathinfo($_FILES['thesaurus']['name'], PATHINFO_EXTENSION);
        if (strtolower($ext) !== 'txt') {
            echo "Only .txt files are allowed.";
            exit;
        }

        if (move_uploaded_file($tmpFile, $targetPath)) {
            echo "File uploaded and thesaurus.txt successfully updated.";
        } else {
            echo "Failed to update thesaurus.txt.";
        }
    } else {
        echo "File upload failed.";
    }
} else {
    http_response_code(405);
    echo "Only POST method is allowed.";
}
?>
