<?php
require 'config.php';

// Twilio Setup (You need to install Twilio PHP SDK via composer or include it manually, 
// OR just use a simple curl request. For now, we will mock the SMS to show it works, 
// and provide the cURL template for the API).

// Twilio Credentials (Replace with your own)
define("TWILIO_SID", "your_twilio_account_sid");
define("TWILIO_TOKEN", "your_twilio_auth_token");
define("TWILIO_FROM", "your_twilio_phone_number");

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

// Backwards-compatible aliases: allow frontend calling send_otp/verify_otp
if ($action === 'send_otp') {
    $action = 'send_email_otp';
}
if ($action === 'verify_otp') {
    $action = 'verify_email_otp';
}

if ($action == 'send_email_otp') {
    $email = $data['email'] ?? '';
    if (empty($email)) sendResponse(false, "Email required");

    $otp = rand(100000, 999999);

    // Invalidate previous unverified OTPs for this email to prevent old codes from being used.
    $invalidate = $conn->prepare("UPDATE otp_requests SET is_verified = TRUE WHERE phone = ? AND is_verified = FALSE");
    $invalidate->bind_param("s", $email);
    $invalidate->execute();

    // Save OTP to DB (stored in phone column for backwards compatibility)
    // Use MySQL's NOW() to avoid PHP/MySQL timezone mismatch issues
    $stmt = $conn->prepare("INSERT INTO otp_requests (phone, otp_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))");
    $stmt->bind_param("ss", $email, $otp);

    if ($stmt->execute()) {

        // --- SEND SMS VIA TWILIO API USING cURL ---
        /*
        $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_SID . "/Messages.json";
        $post_fields = http_build_query([
            'To' => $phone,
            'From' => TWILIO_FROM,
            'Body' => "Your Eduvix OTP is: " . $otp
        ]);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, TWILIO_SID . ":" . TWILIO_TOKEN);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $post_fields);
        $response = curl_exec($ch);
        curl_close($ch);
        */

        require_once __DIR__ . '/email_otp.php';
        $emailSent = send_email_otp($email, strval($otp));

        if ($emailSent) {
            sendResponse(true, "OTP sent successfully to email.");
        } else {
            sendResponse(false, "Failed to send OTP email. Please try again.");
        }
    } else {
        sendResponse(false, "Failed to generate OTP");
    }
}

elseif ($action == 'verify_email_otp') {
    $email = $data['email'] ?? '';
    $otp = $data['otp'] ?? '';

    // Ensure otp_code is compared as string to match otp_requests. We also normalize OTP input defensively.
    $otpNorm = trim(strval($otp));
    // Ensure OTP is numeric 6-digit string (defensive)
    $otpNorm = preg_replace('/\D/', '', $otpNorm);
    if (strlen($otpNorm) > 6) $otpNorm = substr($otpNorm, -6);


    $stmt = $conn->prepare("SELECT id FROM otp_requests WHERE phone = ? AND otp_code = ? AND is_verified = FALSE AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
    // Debug normalization to help resolve mismatched OTP comparisons
    error_log('verify_email_otp phone=' . $email . ' otp_raw=' . strval($otp) . ' otpNorm=' . $otpNorm);
    $stmt->bind_param("ss", $email, $otpNorm);





    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $update = $conn->prepare("UPDATE otp_requests SET is_verified = TRUE WHERE id = ?");
        $update->bind_param("i", $row['id']);
        $update->execute();

        sendResponse(true, "OTP verified successfully");
    } else {
        sendResponse(false, "Invalid or expired OTP");
    }
}

elseif ($action == 'register') {
    // Fields from frontend
    $uid = $data['uid'] ?? '';
    $first_name = $data['first_name'] ?? '';
    $last_name = $data['last_name'] ?? '';
    $full_name = $data['full_name'] ?? '';
    $class = $data['class'] ?? ($data['class_name'] ?? '');
    $gender = $data['gender'] ?? '';
    $email = $data['exam_email'] ?? ($data['email'] ?? '');
    $phone = $data['phone'] ?? '';
    $password = $data['password'] ?? '';


    // Backwards-compatible derived name if full_name not provided
    if (empty($full_name)) {
        $full_name = trim(($first_name ?? '') . ' ' . ($last_name ?? ''));
    }

    // Email OTP verification (email is stored in otp_requests.phone for backwards-compat)
    $otp_email = $email;
    if (empty($otp_email)) {
        sendResponse(false, "Email is required for OTP verification.");
    }


    $check_otp = $conn->prepare("SELECT id FROM otp_requests WHERE phone = ? AND is_verified = TRUE ORDER BY id DESC LIMIT 1");
    $check_otp->bind_param("s", $otp_email);
    $check_otp->execute();
    if ($check_otp->get_result()->num_rows === 0) {
        sendResponse(false, "Email must be verified before registration.");
    }


    if (empty($full_name)) {
        sendResponse(false, "First name and last name are required.");
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    $genderVal = ($gender === 'male' || $gender === 'female') ? $gender : '';

    $stmt = $conn->prepare("INSERT INTO users (full_name, email, phone, password_hash, gender, uid, class) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssss", $full_name, $email, $phone, $hashed_password, $genderVal, $uid, $class);


    if ($stmt->execute()) {
        $newUserId = $stmt->insert_id;

        require_once __DIR__ . '/jwt.php';
        $secret = jwt_get_secret();

        $now = time();
        $payload = [
            'sub' => strval($newUserId),
            'iat' => $now,
            'exp' => $now + 60 * 60 * 24 * 7,
        ];
        $token = jwt_sign($payload, $secret);

        $user = [
            'id' => $newUserId,
            'full_name' => $full_name,
            'email' => $email,
            'phone' => $phone,
            'onboarded' => false,
        ];

        sendResponse(true, "Registration successful", [
            "token" => $token,
            "user" => $user
        ]);
    } else {
        sendResponse(false, "Registration failed. Email or phone might already be in use.");
    }
}

elseif ($action == 'check_uid') {
    $uid = $data['uid'] ?? '';
    if (empty($uid)) {
        sendResponse(false, "UID is required");
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE uid = ? LIMIT 1");
    $stmt->bind_param("s", $uid);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        sendResponse(false, "UID is already taken");
    } else {
        sendResponse(true, "UID is available");
    }
}

elseif ($action == 'login') {
    $emailOrPhone = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $conn->prepare("SELECT id, full_name, email, phone, uid, password_hash, onboarded FROM users WHERE email = ? OR phone = ? LIMIT 1");

    $stmt->bind_param("ss", $emailOrPhone, $emailOrPhone);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password_hash'])) {
            // Convert onboarded to boolean type
            $user['onboarded'] = (bool)$user['onboarded'];
            // Generate JWT token (HS256)
            require_once __DIR__ . '/jwt.php';
            $secret = jwt_get_secret();

            $now = time();
            $payload = [
                // sub = internal user id
                'sub' => strval($user['id']),
                'iat' => $now,
                'exp' => $now + 60 * 60 * 24 * 7, // 7 days
            ];
            $token = jwt_sign($payload, $secret);

            unset($user['password_hash']);

            sendResponse(true, "Login successful", [
                "token" => $token,
                "user" => $user
            ]);
        }

    }
    sendResponse(false, "Invalid credentials");
}

elseif ($action == 'reset_password') {
    $email = $data['email'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    if (empty($email) || empty($newPassword)) {
        sendResponse(false, "Email and new password are required");
    }

    // Ensure email has verified OTP
    $check_otp = $conn->prepare("SELECT id FROM otp_requests WHERE phone = ? AND is_verified = TRUE ORDER BY id DESC LIMIT 1");
    $check_otp->bind_param("s", $email);
    $check_otp->execute();
    if ($check_otp->get_result()->num_rows === 0) {
        sendResponse(false, "Email must be verified before resetting password");
    }

    $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
    $stmt->bind_param("ss", $hashed, $email);
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        sendResponse(true, "Password reset successful");
    } else {
        sendResponse(false, "Failed to reset password");
    }
}
else {
    sendResponse(false, "Invalid action");
}
?>
