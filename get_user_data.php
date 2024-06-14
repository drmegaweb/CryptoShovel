<?php
header('Content-Type: application/json');

if (!isset($_GET['user_id'])) {
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

$user_id = $_GET['user_id'];

try {
    $db = new PDO('sqlite:/var/www/myprojectenv/game.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->prepare('SELECT * FROM users WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        echo json_encode($user);
    } else {
        echo json_encode(['error' => 'User not found']);
    }
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
?>
