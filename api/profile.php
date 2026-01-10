<?php
include_once './db.php';

$db = new Database();
$conn = $db->getConnection();
$user_id = $db->check_login(); 
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // ... inside the GET block ...
try {
    // FIX: Added p.personality_title and p.personality_type to the SELECT list
    $stmt = $conn->prepare("
        SELECT u.full_name, u.email, u.college, p.bio, p.preferred_study_time, p.goal,
               p.focus_time, p.session_length, p.profile_pic_url,
               p.course, p.year_of_passing,
               p.openness, p.conscientiousness, p.extraversion, p.agreeableness, p.neuroticism,
               p.personality_title, p.personality_type
        FROM users u 
        JOIN profiles p ON u.user_id = p.user_id 
        WHERE u.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $profile = $stmt->fetch();
// ... rest of the file ...
        // (Socials, Subjects, Hobbies logic remains exactly the same...)
        $stmt = $conn->prepare("SELECT platform, url FROM social_links WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $profile['socials'] = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        $stmt = $conn->prepare("SELECT s.subject_id, s.subject_name FROM user_subjects us JOIN subjects s ON us.subject_id = s.subject_id WHERE us.user_id = ?");
        $stmt->execute([$user_id]);
        $profile['subjects'] = $stmt->fetchAll();
        
        $stmt = $conn->prepare("SELECT h.hobby_id, h.hobby_name FROM user_hobbies uh JOIN hobbies h ON uh.hobby_id = h.hobby_id WHERE uh.user_id = ?");
        $stmt->execute([$user_id]);
        $profile['hobbies'] = $stmt->fetchAll();

        $db->send_response(true, 'Profile fetched', $profile);

    } catch (PDOException $e) {
        $db->send_response(false, 'Database Error: ' . $e->getMessage());
    }

} elseif ($method == 'POST') {
    
    // File upload logic (Keep your existing code here)
    $profile_pic_sql = "";
    $profile_pic_path = null;
    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
        $file_ext = strtolower(pathinfo($_FILES['profile_picture']['name'], PATHINFO_EXTENSION));
        $unique_name = 'user_' . $user_id . '_' . uniqid() . '.' . $file_ext;
        $target_path = $upload_dir . $unique_name;
        if (move_uploaded_file($_FILES['profile_picture']['tmp_name'], $target_path)) {
            $profile_pic_sql = ", profile_pic_url = ?";
            $profile_pic_path = $target_path;
        }
    }

    try {
        $conn->beginTransaction();
        
        // Update User Basic Info
        $stmt = $conn->prepare("UPDATE users SET full_name = ?, college = ? WHERE user_id = ?");
        $stmt->execute([$_POST['full_name'], $_POST['college'], $user_id]);

        // Update Profile (Including the 5 OCEAN Traits)
        $sql = "
            UPDATE profiles SET 
                bio = ?, preferred_study_time = ?, goal = ?, 
                focus_time = ?, session_length = ?, 
                course = ?, year_of_passing = ?,
                openness = ?, conscientiousness = ?, extraversion = ?, agreeableness = ?, neuroticism = ?
                $profile_pic_sql 
            WHERE user_id = ?
        ";
        
        $params = [
            $_POST['bio'], $_POST['preferred_study_time'], $_POST['goal'],
            $_POST['focus_time'], $_POST['session_length'],
            $_POST['course'], $_POST['year_of_passing'],
            $_POST['openness'], $_POST['conscientiousness'], $_POST['extraversion'], $_POST['agreeableness'], $_POST['neuroticism']
        ];

        if ($profile_pic_path) $params[] = $profile_pic_path;
        $params[] = $user_id;

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        // (Socials, Subjects, Hobbies updates remain exactly the same...)
        // ... (Paste your existing code for social_links, user_subjects, user_hobbies here) ...
        
        // Fix for subjects/hobbies (same as your previous file)
        $subjects = json_decode($_POST['subjects'], true);
        $stmt_del = $conn->prepare("DELETE FROM user_subjects WHERE user_id = ?");
        $stmt_del->execute([$user_id]);
        if (!empty($subjects)) {
            $stmt_ins = $conn->prepare("INSERT INTO user_subjects (user_id, subject_id) VALUES (?, ?)");
            foreach ($subjects as $s) $stmt_ins->execute([$user_id, $s['subject_id']]);
        }

        $hobbies = json_decode($_POST['hobbies'], true);
        $stmt_del = $conn->prepare("DELETE FROM user_hobbies WHERE user_id = ?");
        $stmt_del->execute([$user_id]);
        if (!empty($hobbies)) {
            $stmt_ins = $conn->prepare("INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)");
            foreach ($hobbies as $h) $stmt_ins->execute([$user_id, $h['hobby_id']]);
        }

        $conn->commit();
        $db->send_response(true, 'Profile updated successfully!', ['new_image_url' => $profile_pic_path]);

    } catch (Exception $e) {
        $conn->rollBack();
        $db->send_response(false, 'Update Error: ' . $e->getMessage());
    }
}
?>