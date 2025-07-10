<?php
// Sadece POST isteklerine izin ver
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = file_get_contents("php://input");
    $filePath = "thesaurus.txt";  // thesaurus.txt, public klasördeyse

    // Dosyaya yaz
    if (file_put_contents($filePath, $data) !== false) {
        echo "Saved successfully!";
    } else {
        http_response_code(500);
        echo "Failed to save thesaurus.txt";
    }
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>
