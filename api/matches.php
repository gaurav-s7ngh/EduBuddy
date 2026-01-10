<?php
include_once './db.php';

$db = new Database();
$conn = $db->getConnection();
$current_user_id = $db->check_login();

// Check for a limit parameter (e.g., ?limit=5 for dashboard)
$limit_sql = "";
if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
    $limit_sql = "LIMIT " . intval($_GET['limit']);
}

try {
    // 1. Get current user's data (college, focus_time, AND numeric personality traits)
    $stmt = $conn->prepare("
        SELECT 
            u.college, 
            p.focus_time,
            COALESCE(p.openness, 50) as openness,
            COALESCE(p.conscientiousness, 50) as conscientiousness,
            COALESCE(p.extraversion, 50) as extraversion,
            COALESCE(p.agreeableness, 50) as agreeableness,
            COALESCE(p.neuroticism, 50) as neuroticism
        FROM users u
        LEFT JOIN profiles p ON u.user_id = p.user_id
        WHERE u.user_id = ?
    ");
    $stmt->execute([$current_user_id]);
    $currentUser = $stmt->fetch();

    if (!$currentUser) {
        $db->send_response(false, 'User profile not found');
    }

    // 2. Main matching query
    $sql = "
        SELECT
            u.user_id,
            u.full_name,
            u.college,
            p.bio,
            p.goal,
            p.focus_time,
            p.profile_pic_url,
            p.personality_title, -- Keep this for display if you want

            -- Score 1: Common Subjects (5 pts per subject)
            (SELECT COUNT(DISTINCT us.subject_id) * 5
             FROM user_subjects us
             WHERE us.user_id = u.user_id AND us.subject_id IN (
                SELECT subject_id FROM user_subjects WHERE user_id = ?
             )) AS common_subjects_score,

            -- Score 2: Common Hobbies (2 pts per hobby)
            (SELECT COUNT(DISTINCT uh.hobby_id) * 2
             FROM user_hobbies uh
             WHERE uh.user_id = u.user_id AND uh.hobby_id IN (
                SELECT hobby_id FROM user_hobbies WHERE user_id = ?
             )) AS common_hobbies_score,

            -- Score 3: College Boost (10 pts)
            IF(u.college = ?, 10, 0) AS college_boost,

            -- Score 4: STUDY STYLE MATCH (15 pts)
            IF(p.focus_time = ? AND p.focus_time != 'flexible', 15, 0) AS study_preference_score,

            -- Score 5: ADVANCED PERSONALITY SCORE (Max 50 pts)
            -- Logic: 500 is max possible difference. We subtract the difference from 500, then divide by 10.
            (
                500 - (
                    ABS(COALESCE(p.openness, 50) - ?) +
                    ABS(COALESCE(p.conscientiousness, 50) - ?) +
                    ABS(COALESCE(p.extraversion, 50) - ?) +
                    ABS(COALESCE(p.agreeableness, 50) - ?) +
                    ABS(COALESCE(p.neuroticism, 50) - ?)
                )
            ) / 10 AS personality_score,
            
            -- Fetch lists for display
            (SELECT GROUP_CONCAT(s.subject_name SEPARATOR ', ')
             FROM user_subjects us_all
             JOIN subjects s ON us_all.subject_id = s.subject_id
             WHERE us_all.user_id = u.user_id AND us_all.subject_id IN (
                SELECT subject_id FROM user_subjects WHERE user_id = ?
             )) AS common_subjects_list,

            (SELECT GROUP_CONCAT(h.hobby_name SEPARATOR ', ')
             FROM user_hobbies uh_all
             JOIN hobbies h ON uh_all.hobby_id = h.hobby_id
             WHERE uh_all.user_id = u.user_id AND uh_all.hobby_id IN (
                SELECT hobby_id FROM user_hobbies WHERE user_id = ?
             )) AS common_hobbies_list

        FROM users u
        LEFT JOIN profiles p ON u.user_id = p.user_id

        WHERE u.user_id != ? 

        GROUP BY u.user_id, u.full_name, u.college, p.bio, p.goal, p.focus_time, p.profile_pic_url, p.personality_title

        -- Filter: Must have at least SOME compatibility
        HAVING (common_subjects_score + common_hobbies_score + college_boost + personality_score + study_preference_score) > 0
            
        ORDER BY
            (common_subjects_score + common_hobbies_score + college_boost + personality_score + study_preference_score) DESC

        $limit_sql;
    ";

    $stmt = $conn->prepare($sql);

    $stmt->execute([
        $current_user_id,   // subjects score
        $current_user_id,   // hobbies score
        $currentUser['college'], // college boost
        $currentUser['focus_time'], // study style
        // The 5 Numeric Traits for comparison:
        $currentUser['openness'],
        $currentUser['conscientiousness'],
        $currentUser['extraversion'],
        $currentUser['agreeableness'],
        $currentUser['neuroticism'],
        $current_user_id,   // common subj list
        $current_user_id,   // common hobby list
        $current_user_id    // exclude self
    ]);

    $matches = $stmt->fetchAll();
    
    $db->send_response(true, 'Matches found', $matches);

} catch (PDOException $e) {
    $db->send_response(false, 'Database Error: ' . $e->getMessage());
}
?>