<?php

header('Content-Type: application/json');

function respond($success, $message, $status = 200) {
    http_response_code($status);

    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);

    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request.', 405);
}

// Get form data
$clientName = trim($_POST['client_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$contactNumber = trim($_POST['contact_number'] ?? '');
$preferredDestination = trim($_POST['preferred_destination'] ?? '');
$topic = trim($_POST['topic'] ?? '');
$message = trim($_POST['message'] ?? '');

// Validate required fields
if (
    $clientName === '' ||
    $email === '' ||
    $contactNumber === '' ||
    $preferredDestination === '' ||
    $topic === '' ||
    $message === ''
) {
    respond(false, 'Please complete all required fields.', 400);
}

// Validate client name
if (
    preg_match("/\A[\p{L}\p{M} ,.'’\-]+\z/u", $clientName) !== 1 ||
    preg_match('/\p{L}/u', $clientName) !== 1
) {
    respond(
        false,
        'Please enter a valid name using letters, spaces, commas, apostrophes, hyphens, and periods only. Numbers and other special characters are not permitted.',
        400
    );
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 400);
}

try {
    require __DIR__ . '/db.php';

    $sql = "INSERT INTO client_inquiries
            (client_name, email, contact_number, preferred_destination, topic, message)
            VALUES
            (:client_name, :email, :contact_number, :preferred_destination, :topic, :message)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':client_name' => $clientName,
        ':email' => $email,
        ':contact_number' => $contactNumber,
        ':preferred_destination' => $preferredDestination,
        ':topic' => $topic,
        ':message' => $message
    ]);

    respond(true, 'Your inquiry has been submitted successfully!');

} catch (PDOException $e) {
    respond(false, 'Unable to submit your inquiry. Please try again.', 500);
}