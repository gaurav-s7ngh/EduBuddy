<?php
// api/db.php

// 1. Include CORS handling at the very top
include_once __DIR__ . '/cors.php';

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    public $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST');
        $this->db_name = getenv('DB_NAME');
        $this->username = getenv('DB_USER');
        $this->password = getenv('DB_PASS');
        $this->port = getenv('DB_PORT') ?: 3306;

        // CRITICAL: Configure sessions to work between Vercel and Render
        if (session_status() === PHP_SESSION_NONE) {
            // This ensures cookies work across different domains (Vercel <-> Render)
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'secure' => true,      // Required for None
                'httponly' => true,
                'samesite' => 'None'   // Required for Cross-Site
            ]);
            session_start();
        }
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }

    // --- RESTORED METHOD ---
    // Checks if user is logged in. If not, stops everything and sends error.
    public function check_login() {
        // Double check session is started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['user_id'])) {
            $this->send_response(false, 'Access denied. Please log in.');
            exit; // Stop the script here
        }

        return $_SESSION['user_id'];
    }

    public function send_response($success, $message, $data = []) {
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }
}
?>