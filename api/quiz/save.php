<?php
// api/quiz/save.php
include_once '../db.php';

header('Content-Type: application/json');

$db = new Database();
$conn = $db->getConnection();
$user_id = $db->check_login();

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['answers'])) {
    $db->send_response(false, 'No answers received.');
    exit;
}

$answers = $input['answers']; 
$questions = $input['questions']; 

// Initialize aggregators
$scores = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];
$counts = ['O' => 0, 'C' => 0, 'E' => 0, 'A' => 0, 'N' => 0];

// 1. Calculate Raw Scores
foreach ($questions as $q) {
    $qid = $q['id'];
    
    // FIX 1: Handle "domain" (from ipip120.js) instead of "trait"
    $domain = isset($q['domain']) ? $q['domain'] : (isset($q['trait']) ? $q['trait'] : 'O');
    
    // FIX 2: Handle numeric keys (1 or -1)
    // If key is -1, we reverse the score (1->5, 5->1)
    $key = isset($q['key']) ? intval($q['key']) : 1;

    if (isset($answers[$qid])) {
        $val = intval($answers[$qid]);
        
        // Reverse scoring logic
        if ($key === -1) {
            $val = 6 - $val;
        }

        $scores[$domain] += $val;
        $counts[$domain]++;
    }
}

// 2. Convert to Percentage (0-100)
$final_scores = [];
foreach ($scores as $domain => $raw_score) {
    // Min possible score = count * 1
    // Max possible score = count * 5
    $min = $counts[$domain] * 1; 
    $max = $counts[$domain] * 5;
    
    if ($max > $min) {
        $percent = round((($raw_score - $min) / ($max - $min)) * 100);
    } else {
        $percent = 50; 
    }
    $final_scores[$domain] = $percent;
}

// 3. Generate Scientific 5-Letter Code (SLOAN notation)
// Uppercase = High (>=50%), Lowercase = Low (<50%)
$type_code = "";
$type_code .= ($final_scores['O'] >= 50) ? 'O' : 'o';
$type_code .= ($final_scores['C'] >= 50) ? 'C' : 'c';
$type_code .= ($final_scores['E'] >= 50) ? 'E' : 'e';
$type_code .= ($final_scores['A'] >= 50) ? 'A' : 'a';
$type_code .= ($final_scores['N'] >= 50) ? 'N' : 'n';

// 4. Map Code to "Cool Titles" (Scientific Definitions)
$titles = [
    // High Openness
    'OCEAN' => 'The Visionary',   'OCEAn' => 'The Director',
    'OCEaN' => 'The Commander',   'OCEan' => 'The Executive',
    'OCeAN' => 'The Perfectionist','OCeAn' => 'The Architect',
    'OCeaN' => 'The Strategist',  'OCean' => 'The Scholar',
    'OcEAN' => 'The Activist',    'OcEAn' => 'The Inspirer',
    'OcEaN' => 'The Debater',     'OcEan' => 'The Entrepreneur',
    'OceAN' => 'The Poet',        'OceAn' => 'The Dreamer',
    'OceaN' => 'The Individualist','Ocean' => 'The Thinker',

    // Low Openness
    'oCEAN' => 'The Host',        'oCEAn' => 'The Supervisor',
    'oCEaN' => 'The Enforcer',    'oCEan' => 'The Manager',
    'oCeAN' => 'The Defender',    'oCeAn' => 'The Traditionalist',
    'oCeaN' => 'The Specialist',  'oCean' => 'The Realist',
    'ocEAN' => 'The Performer',   'ocEAn' => 'The Entertainer',
    'ocEaN' => 'The Competitor',  'ocEan' => 'The Mechanic',
    'oceAN' => 'The Supporter',   'oceAn' => 'The Peacekeeper',
    'oceaN' => 'The Skeptic',     'ocean' => 'The Observer'
];

$personality_title = isset($titles[$type_code]) ? $titles[$type_code] : 'The Student';

// 5. Update Database
try {
    // Note: We create a fallback in case 'personality_type' column doesn't exist yet
    // You might need to run: ALTER TABLE profiles ADD COLUMN personality_type VARCHAR(10);
    
    $stmt = $conn->prepare("
        UPDATE profiles SET 
        openness = ?, 
        conscientiousness = ?, 
        extraversion = ?, 
        agreeableness = ?, 
        neuroticism = ?,
        personality_title = ?,
        personality_type = ?
        WHERE user_id = ?
    ");

    $stmt->execute([
        $final_scores['O'],
        $final_scores['C'],
        $final_scores['E'],
        $final_scores['A'],
        $final_scores['N'],
        $personality_title,
        $type_code,
        $user_id
    ]);

    $db->send_response(true, 'Personality calculated', [
        'openness' => $final_scores['O'],
        'conscientiousness' => $final_scores['C'],
        'extraversion' => $final_scores['E'],
        'agreeableness' => $final_scores['A'],
        'neuroticism' => $final_scores['N'],
        'personality_title' => $personality_title,
        'personality_type' => $type_code
    ]);

} catch (PDOException $e) {
    // Fallback: If 'personality_type' column is missing in DB, try updating without it
    try {
        $stmt = $conn->prepare("
            UPDATE profiles SET 
            openness = ?, conscientiousness = ?, extraversion = ?, agreeableness = ?, neuroticism = ?,
            personality_title = ?
            WHERE user_id = ?
        ");
        $stmt->execute([
            $final_scores['O'], $final_scores['C'], $final_scores['E'], $final_scores['A'], $final_scores['N'],
            $personality_title, $user_id
        ]);
        $db->send_response(true, 'Saved (Legacy Mode)', $final_scores);
    } catch (Exception $ex) {
        $db->send_response(false, 'Database Error: ' . $ex->getMessage());
    }
}
?>