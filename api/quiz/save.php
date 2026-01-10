<?php
include_once '../db.php';

$db = new Database();
$conn = $db->getConnection();
$user_id = $db->check_login();
$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['answers'])) {
    $db->send_response(false, 'No answers provided.');
}

$answers = $input['answers']; // [ "1" => 5, "2" => 3, ... ]
$questions = $input['questions']; // We pass definitions from frontend to ensure sync

// Initialize scores
$scores = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];
$counts = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];

// Calculate Raw Scores
foreach ($questions as $q) {
    $qid = $q['id'];
    $trait = $q['trait'];
    $key = $q['key'];
    
    if (isset($answers[$qid])) {
        $val = intval($answers[$qid]);
        
        // Handle Reverse Scoring
        // Standard: 1, 2, 3, 4, 5
        // Reverse:  5, 4, 3, 2, 1 (Formula: 6 - val)
        if ($key === '-') {
            $val = 6 - $val;
        }

        $scores[$trait] += $val;
        $counts[$trait]++;
    }
}

// Convert to Percentage (0-100)
// Min score per trait (4 questions) = 4
// Max score per trait (4 questions) = 20
// Formula: ((Score - Min) / (Max - Min)) * 100
$final_scores = [];
foreach ($scores as $trait => $raw_score) {
    $min = $counts[$trait] * 1; 
    $max = $counts[$trait] * 5;
    
    if ($max > $min) {
        $percent = round((($raw_score - $min) / ($max - $min)) * 100);
    } else {
        $percent = 50; // Default if error
    }
    $final_scores[$trait] = $percent;
}

// Determine a "Title" based on highest trait (just for fun/display)
$max_trait_val = max($final_scores);
$dom_trait = array_search($max_trait_val, $final_scores);
$titles = [
    'O' => 'The Visionary',
    'C' => 'The Architect',
    'E' => 'The Energizer',
    'A' => 'The Peacemaker',
    'N' => 'The Sentinel'
];
$personality_title = $titles[$dom_trait] . " (" . $dom_trait . ")";


// Update Database
try {
    $stmt = $conn->prepare("
        UPDATE profiles SET 
        openness = ?, 
        conscientiousness = ?, 
        extraversion = ?, 
        agreeableness = ?, 
        neuroticism = ?,
        personality_title = ?
        WHERE user_id = ?
    ");

    $stmt->execute([
        $final_scores['O'],
        $final_scores['C'],
        $final_scores['E'],
        $final_scores['A'],
        $final_scores['N'],
        $personality_title,
        $user_id
    ]);

    $db->send_response(true, 'Personality calculated', [
        'openness' => $final_scores['O'],
        'conscientiousness' => $final_scores['C'],
        'extraversion' => $final_scores['E'],
        'agreeableness' => $final_scores['A'],
        'neuroticism' => $final_scores['N'],
        'personality_title' => $personality_title
    ]);

} catch (PDOException $e) {
    $db->send_response(false, 'Database Update Error: ' . $e->getMessage());
}
?>