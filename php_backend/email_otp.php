<?php
// Uses PHPMailer for sending OTP emails

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

function send_email_otp(string $toEmail, string $otp): bool {
  $mail = new PHPMailer(true);

  try {
      $mail->isSMTP();
      $mail->Host       = $_ENV['SMTP_HOST'] ?? getenv('SMTP_HOST') ?: 'smtp.gmail.com'; 
      $mail->SMTPAuth   = true;
      $mail->Username   = $_ENV['SMTP_USER'] ?? getenv('SMTP_USER') ?: 'official.eduvix@gmail.com'; 
      $mail->Password   = $_ENV['SMTP_PASS'] ?? getenv('SMTP_PASS') ?: 'tveiqqqknvtjomnk'; 
      $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
      $mail->Port       = $_ENV['SMTP_PORT'] ?? getenv('SMTP_PORT') ?: 587; 

      $fromEmail = $_ENV['MAIL_FROM'] ?? getenv('MAIL_FROM') ?: 'official.eduvix@gmail.com';
      $fromName = 'Eduvix Auth';

      $mail->setFrom($fromEmail, $fromName);
      $mail->addAddress($toEmail);

      $mail->isHTML(true);
      $mail->Subject = 'Eduvix OTP Verification';
      $mail->Body    = "Your Eduvix email OTP is: <b>{$otp}</b><br><br>This code expires in 10 minutes.";
      $mail->AltBody = "Your Eduvix email OTP is: {$otp}\n\nThis code expires in 10 minutes.";

      $mail->send();
      return true;
  } catch (Exception $e) {
      error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
      return false;
  }
}
