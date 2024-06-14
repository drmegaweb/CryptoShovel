<?php
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['user_id'])) {
    echo json_encode(['error' => 'User ID is required']);
    exit;
}

$user_id = $data['user_id'];

try {
    $db = new PDO('sqlite:/var/www/myprojectenv/game.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $db->prepare('
        UPDATE users
        SET coins = ?, energy = ?, max_energy = ?, level = ?, tap_profit = ?, bonus_points = ?, chance_multiplier = ?, skin_multiplier = ?, skin_improved = ?
        WHERE user_id = ?
    ');
    
    $stmt->execute([
        $data['coins'],
        $data['energy'],
        $data['max_energy'],
        $data['level'],
        $data['tap_profit'],
        $data['bonus_points'],
        $data['chance_multiplier'],
        $data['skin_multiplier'],
        $data['skin_improved'],
        $user_id
    ]);

    if ($stmt->rowCount() > 0) {
        error_log('User data updated successfully for user ID: ' . $user_id);
        echo json_encode(['success' => true]);
    } else {
        error_log('Failed to update user data for user ID: ' . $user_id);
        echo json_encode(['success' => false, 'error' => 'Failed to update user data']);
    }
} catch (PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
}
?>
