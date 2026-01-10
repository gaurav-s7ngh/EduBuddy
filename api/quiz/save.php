<?php
include_once '../db.php';

$db = new Database();
$conn = $db->getConnection();
$user_id = $db->check_login();
$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['answers'])) {
    $db->send_response(false, 'No data provided.');
}

$userAnswers = $data['answers']; // Format: { "1": 5, "2": 1, ... }

// --- 1. Define The Scoring Key ---
// In a production app, you might store this in a DB table or separate file
// For now, we replicate the JS structure here
$questions = [
    // Must match the IDs and Domains in ipip120.js
    1 => ['domain' => 'E', 'key' => 1],
    2 => ['domain' => 'E', 'key' => -1],
    3 => ['domain' => 'E', 'key' => 1],
    // ... You MUST populate this array with all 120 keys for accurate scoring
    // For this example, I will assume the simplified array from step 2
    16 => ['domain' => 'N', 'key' => 1],
    // ... etc
];

// Initialize Scores
$scores = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];
$counts = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];

foreach ($userAnswers as $qId => $val) {
    // If we have a key definition for this question
    if (isset($questions[$qId])) {
        $domain = $questions[$qId]['domain'];
        $key = $questions[$qId]['key'];
        
        // Normalize value (1-5)
        // If Key is 1 (Positive): 5=5, 1=1
        // If Key is -1 (Negative): 5=1, 1=5  (Reverse scoring: 6 - val)
        $score = ($key === 1) ? $val : (6 - $val);
        
        $scores[$domain] += $score;
        $counts[$domain]++;
    }
}

// Calculate percentages (0-100)
// Max score per question is 5.
$finalScores = [];
foreach ($scores as $domain => $total) {
    if ($counts[$domain] > 0) {
        $average = $total / $counts[$domain]; // 1 to 5
        // Map 1..5 to 0..100
        $finalScores[$domain] = round((($average - 1) / 4) * 100);
    } else {
        $finalScores[$domain] = 50; // Default
    }
}

try {
    $conn->beginTransaction();

    // 1. Save Raw Answers (for future reference)
    $stmt = $conn->prepare("INSERT INTO quiz_answers (user_id, answers_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE answers_json = VALUES(answers_json)");
    $stmt->execute([$user_id, json_encode($userAnswers)]);

    // 2. Save Calculated Scores
    $stmt = $conn->prepare("
        UPDATE profiles 
        SET openness = ?, conscientiousness = ?, extraversion = ?, agreeableness = ?, neuroticism = ?
        WHERE user_id = ?
    ");
    $stmt->execute([
        $finalScores['O'], 
        $finalScores['C'], 
        $finalScores['E'], 
        $finalScores['A'], 
        $finalScores['N'], 
        $user_id
    ]);

    $conn->commit();
    
    $db->send_response(true, 'Results saved!', [
        'scores' => $finalScores
    ]);

} catch (PDOException $e) {
    $conn->rollBack();
    $db->send_response(false, 'Database Error: ' . $e->getMessage());
}
?>