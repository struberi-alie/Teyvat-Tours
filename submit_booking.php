
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
    respond(false, 'Invalid request method.', 405);
}

// Get submitted form values
$packageId = filter_input(INPUT_POST, 'package_id', FILTER_VALIDATE_INT);
$clientName = trim($_POST['client_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$contactNumber = trim($_POST['contact_number'] ?? '');
$travelDate = trim($_POST['travel_date'] ?? '');
$adults = filter_input(INPUT_POST, 'adults', FILTER_VALIDATE_INT);
$children = filter_input(INPUT_POST, 'children', FILTER_VALIDATE_INT);
$specialRequests = trim($_POST['special_requests'] ?? '');
$paymentMethod = trim($_POST['payment_method'] ?? '');

// Validate required fields
if (
    !$packageId ||
    $clientName === '' ||
    $email === '' ||
    $contactNumber === '' ||
    $travelDate === '' ||
    $adults === false ||
    $adults === null ||
    $children === false ||
    $children === null ||
    $paymentMethod === ''
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

// Validate traveler count
if ($adults < 0 || $children < 0 || ($adults + $children) < 1) {
    respond(false, 'Please add at least one traveler.', 400);
}

// Require at least one adult
if ($adults < 1) {
    respond(
        false,
        'Your booking cannot be processed automatically because at least one adult is required. If a minor or minors need to travel without an adult, please submit an inquiry so our agency can review and manually handle your request.',
        400
    );
}

// Validate travel date
$date = DateTime::createFromFormat('!Y-m-d', $travelDate);

if (
    !$date ||
    $date->format('Y-m-d') !== $travelDate ||
    $date < new DateTime('today')
) {
    respond(false, 'Please enter a valid future travel date.', 400);
}

// Validate payment method
$allowedPayments = ['gcash', 'card', 'bank'];

if (!in_array($paymentMethod, $allowedPayments, true)) {
    respond(false, 'Please select a valid payment method.', 400);
}

try {
    require __DIR__ . '/db.php';

    // Confirm that the selected package exists
    $checkPackage = $pdo->prepare(
        'SELECT package_id FROM tour_packages WHERE package_id = :package_id'
    );

    $checkPackage->execute([
        ':package_id' => $packageId
    ]);

    if (!$checkPackage->fetch()) {
        respond(false, 'Selected tour package does not exist.', 400);
    }

    // Save booking request
    $sql = "INSERT INTO booking_requests
        (package_id, client_name, email, contact_number,
         travel_date, adults, children, special_requests, payment_method)
        VALUES
        (:package_id, :client_name, :email, :contact_number,
         :travel_date, :adults, :children, :special_requests, :payment_method)";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':package_id' => $packageId,
        ':client_name' => $clientName,
        ':email' => $email,
        ':contact_number' => $contactNumber,
        ':travel_date' => $travelDate,
        ':adults' => $adults,
        ':children' => $children,
        ':special_requests' => $specialRequests,
        ':payment_method' => $paymentMethod
    ]);

    respond(true, 'Your booking request has been submitted successfully!');

} catch (PDOException $e) {
    respond(false, 'Unable to save your booking. Please try again.', 500);
}
