<?php
include_once './db.php';

$db = new Database();
$conn = $db->getConnection();
$user_id = $db->check_login(); 
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // ... (Keep your GET logic exactly as it was, no changes needed there) ...
    try {
        $stmt = $conn->prepare("SELECT u.full_name, u.email, u.college, p.bio, p.preferred_study_time, p.goal, p.focus_time, p.session_length, p.personality_type, p.personality_title, p.course, p.year_of_passing, p.profile_pic_url FROM users u JOIN profiles p ON u.user_id = p.user_id WHERE u.user_id = ?");
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch();

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
    
    $profile_pic_sql = "";
    $profile_pic_path = null;

    if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] == 0) {
        $upload_dir = 'uploads/';
        if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true); // Ensure dir exists

        $file = $_FILES['profile_picture'];
        
        // FIX: Verify actual file type (MIME), not just extension
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime_type = $finfo->file($file['tmp_name']);
        $allowed_mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (!in_array($mime_type, $allowed_mimes)) {
            $db->send_response(false, 'Invalid file type. Only JPG, PNG, GIF, WEBP allowed.');
        }

        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        // Double check extension just in case
        if (!in_array($file_ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            $db->send_response(false, 'Invalid file extension.');
        }

        if ($file['size'] < 5000000) { 
            $unique_name = 'user_' . $user_id . '_' . uniqid() . '.' . $file_ext;
            $target_path = $upload_dir . $unique_name;

            if (move_uploaded_file($file['tmp_name'], $target_path)) {
                $profile_pic_sql = ", profile_pic_url = ?"; 
                $profile_pic_path = $target_path; 
            } else {
                $db->send_response(false, 'Error moving uploaded file.');
            }
        } else {
            $db->send_response(false, 'File is too large (Max 5MB).');
        }
    }

    try {
        $conn->beginTransaction();
        
        $stmt = $conn->prepare("UPDATE users SET full_name = ?, college = ? WHERE user_id = ?");
        $stmt->execute([$_POST['full_name'], $_POST['college'], $user_id]);

        $sql = "UPDATE profiles SET bio = ?, preferred_study_time = ?, goal = ?, focus_time = ?, session_length = ?, course = ?, year_of_passing = ? $profile_pic_sql WHERE user_id = ?";
        
        $params = [
            $_POST['bio'], $_POST['preferred_study_time'], $_POST['goal'],
            $_POST['focus_time'], $_POST['session_length'],
            $_POST['course'], $_POST['year_of_passing'],
        ];

        if ($profile_pic_path) {
            $params[] = $profile_pic_path;
        }
        $params[] = $user_id; 

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        $stmt = $conn->prepare("DELETE FROM social_links WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $stmt_social = $conn->prepare("INSERT INTO social_links (user_id, platform, url) VALUES (?, ?, ?)");
        $platforms = ['whatsapp', 'instagram', 'discord', 'github', 'linkedin', 'twitter'];
        foreach ($platforms as $platform) {
            if (!empty($_POST[$platform])) {
                $stmt_social->execute([$user_id, $platform, $_POST[$platform]]);
            }
        }
        
        $subjects = json_decode($_POST['subjects'], true);
        $hobbies = json_decode($_POST['hobbies'], true);

        $stmt_delete_subjects = $conn->prepare("DELETE FROM user_subjects WHERE user_id = ?");
        $stmt_delete_subjects->execute([$user_id]);
        if (!empty($subjects) && is_array($subjects)) {
            $stmt_insert_subject = $conn->prepare("INSERT INTO user_subjects (user_id, subject_id) VALUES (?, ?)");
            foreach ($subjects as $subject) {
                if (isset($subject['subject_id'])) {
                    $stmt_insert_subject->execute([$user_id, $subject['subject_id']]);
                }
            }
        }
        
        $stmt_delete_hobbies = $conn->prepare("DELETE FROM user_hobbies WHERE user_id = ?");
        $stmt_delete_hobbies->execute([$user_id]);
        if (!empty($hobbies) && is_array($hobbies)) {
            $stmt_insert_hobby = $conn->prepare("INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)");
            foreach ($hobbies as $hobby) {
                if (isset($hobby['hobby_id'])) {
                    $stmt_insert_hobby->execute([$user_id, $hobby['hobby_id']]);
                }
            }
        }
        
        $conn->commit();
        $db->send_response(true, 'Profile updated successfully!', [
            'new_image_url' => $profile_pic_path 
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        $db->send_response(false, 'Update Error: ' . $e->getMessage());
    }
}
?>