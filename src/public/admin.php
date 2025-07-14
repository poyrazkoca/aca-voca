<?php
session_start();

// Giriş kontrolü yapılmışsa doğrudan panele yönlendir
if (isset($_SESSION['admin']) && $_SESSION['admin'] === true) {
    header("Location: panel.html");
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Burada gerçek kullanıcı adı ve şifre kontrolü yapılır
    if ($username === 'kullaniciadi' && $password === 'sifre') {
        $_SESSION['admin'] = true;
        header("Location: panel.html");
        exit;
    } else {
        $error = "The username or password is incorrect.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin Panel</title>
    <link rel="icon" href="favicon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="admin.css">
    <style>
        html, body {
            height: auto;
            margin: 0;
            padding: 0;
        }
        .header {
            height: 80px;
        }
        .footer {
            position: static;
            background-color: #072e46;
            color: white;
            padding: 20px 20px;
            text-align: center;
            margin-top: 40px;
            width: 100%;
            font-size: 0.8rem;
            bottom: 0;
            z-index: 1000;
        }
        .footer a {
            color: white;
            text-decoration: none;
            text-decoration: underline;
        }
        #errorMsg {
            color: red;
            margin-top: 10px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
<!-- Header -->
<header class="header">
    <div class="header-left">
        <img src="logo.png" alt="Logo" class="logo">
        <span class="title-text">Academic Vocabulary Search Engine</span>
    </div>
</header>

<!-- Go Back Button -->
<button class="go-back-btn" onclick="window.location.href='index.html'">❮❮ Go Home</button>

<!-- Theme Toggle -->
<div class="theme-toggle" onclick="toggleTheme()">
    <div class="toggle-thumb" id="themeEmoji">🌞</div>
</div>

<!-- Main Content -->
<div class="main-content">
    <div class="container">
        <div class="admin-title">Admin Panel</div>
        <form id="loginForm" method="POST" action="admin.php">
            <input type="text" name="username" id="username" placeholder="username" required>
            <div class="password-wrapper">
                <input type="password" name="password" id="password" placeholder="password" required>
                <span class="toggle-password" onclick="togglePassword()">👀</span>
            </div>
            <div class="login-btn-row">
                <button type="submit">Log In</button>
            </div>
            <?php if ($error): ?>
                <p id="errorMsg"><?= htmlspecialchars($error) ?></p>
            <?php endif; ?>
        </form>
    </div>
</div>

<footer class="footer">
    <p style="font-size: 0.9em;">Copyright © 2025 - Academic Vocabulary - Last update date: June 2025</p>
    <p style="font-size: 0.7em;">Developed by <a href="https://www.linkedin.com/in/poyrazkoca/" target="_blank">Poyraz Koca</a></p>
</footer>

<script>
    document.addEventListener('DOMContentLoaded', applyTheme);

    function toggleTheme() {
        const body = document.body;
        const emoji = document.getElementById('themeEmoji');
        const toggle = document.querySelector('.theme-toggle');

        const isDark = body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        emoji.textContent = isDark ? '🌙' : '🌞';
        emoji.style.transform = isDark ? 'translateX(30px)' : 'translateX(0)';
        toggle.style.backgroundColor = isDark ? '#333' : '#ccc';
    }

    function applyTheme() {
        const saved = localStorage.getItem('theme');
        const dark = saved === 'dark';
        if (dark) {
            document.body.classList.add('dark-theme');
            document.getElementById('themeEmoji').textContent = '🌙';
            document.getElementById('themeEmoji').style.transform = 'translateX(30px)';
            document.querySelector('.theme-toggle').style.backgroundColor = '#333';
        }
    }

    function togglePassword() {
        const passField = document.getElementById('password');
        passField.type = passField.type === 'password' ? 'text' : 'password';
    }
</script>
</body>
</html>
