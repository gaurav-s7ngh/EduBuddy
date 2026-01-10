<?php
// --- CORS HEADERS (Crucial for Vercel) ---
header("Access-Control-Allow-Origin: *"); // In production, replace * with your Vercel URL
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle Preflight Request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --- CONFIGURATION ---
// Use environment variables if available, otherwise fallback to local/hardcoded
define('DB_HOST', getenv('DB_HOST') ?: 'sql107.infinityfree.com');
define('DB_USER', getenv('DB_USER') ?: 'if0_40874091'); 
define('DB_PASS', getenv('DB_PASS') ?: 'R9mH58SAJWiOL');     
define('DB_NAME', getenv('DB_NAME') ?: 'if0_40874091_edubuddy');

// --- APP ---
header('Content-Type: application/json');
ini_set('display_errors', 0); // Hide errors from output in production
ini_set('log_errors', 1);     // Log them to file instead
error_reporting(E_ALL);

// Start session to track logged-in users
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO('mysql:host=' . $this->host . ';dbname=' . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            // Don't show full error details to the user in production
            error_log("Connection Error: " . $e->getMessage());
            $this->send_response(false, 'Database Connection Failed.');
        }
        return $this->conn;
    }
    
    public function send_response($success, $message, $data = []) {
        echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
        exit;
    }

    public function check_login() {
        if (!isset($_SESSION['user_id'])) {
            $this->send_response(false, 'Unauthorized. Please log in.');
        }
        return $_SESSION['user_id'];
    }
}
?>