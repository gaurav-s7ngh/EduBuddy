<?php
include_once './db.php';

$db = new Database();
$conn = $db->getConnection();
$current_user_id = $db->check_login();

$limit_sql = "";
if (isset($_GET['limit']) && is_numeric($_GET['limit'])) {
    $limit_sql = "LIMIT " . intval($_GET['limit']);
}

try {
    // 1. Get current user's scores
    $stmt = $conn->prepare("
        SELECT openness, conscientiousness, extraversion, agreeableness, neuroticism, college, focus_time
        FROM profiles p
        JOIN users u ON u.user_id = p.user_id
        WHERE u.user_id = ?
    ");
    $stmt->execute([$current_user_id]);
    $me = $stmt->fetch();

    if (!$me) $db->send_response(false, "Profile not found.");

    // 2. Complex Matching Query
    $sql = "
        SELECT
            u.user_id, u.full_name, u.college,
            p.bio, p.goal, p.focus_time, p.profile_pic_url,
            p.openness, p.conscientiousness, p.extraversion, p.agreeableness, p.neuroticism,

            -- Compatibility Score Calculation (Euclidean Distance based)
            -- Maximum difference per trait is 100. Max total distance is sqrt(5 * 100^2) approx 223.
            -- We convert this to a % score. Higher is closer.
            (100 - (
                SQRT(
                    POW(p.openness - ?, 2) +
                    POW(p.conscientiousness - ?, 2) +
                    POW(p.extraversion - ?, 2) +
                    POW(p.agreeableness - ?, 2) +
                    POW(p.neuroticism - ?, 2)
                ) / 2.23
            )) AS personality_match_score,

            -- Common Subjects (Keeping your logic)
            (SELECT COUNT(DISTINCT us.subject_id) * 5
             FROM user_subjects us
             WHERE us.user_id = u.user_id AND us.subject_id IN (
                SELECT subject_id FROM user_subjects WHERE user_id = ?
             )) AS common_subjects_score,

            -- College Boost
            IF(u.college = ?, 10, 0) AS college_boost

        FROM users u
        LEFT JOIN profiles p ON u.user_id = p.user_id
        WHERE u.user_id != ?
        AND u.user_id NOT IN (
            SELECT user_two_id FROM matches WHERE user_one_id = ?
            UNION
            SELECT user_one_id FROM matches WHERE user_two_id = ?
        )
        
        -- Prioritize high compatibility
        ORDER BY (personality_match_score + common_subjects_score + college_boost) DESC
        $limit_sql;
    ";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $me['openness'], $me['conscientiousness'], $me['extraversion'], $me['agreeableness'], $me['neuroticism'],
        $current_user_id, // common subjects
        $me['college'],   // college boost
        $current_user_id, // exclude self
        $current_user_id, // exclude matches
        $current_user_id
    ]);

    $matches = $stmt->fetchAll();
    $db->send_response(true, 'Matches found', $matches);

} catch (PDOException $e) {
    $db->send_response(false, 'Database Error: ' . $e->getMessage());
}
?>