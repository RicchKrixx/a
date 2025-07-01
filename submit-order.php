<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $name    = $_POST['name']    ?? '';
  $email   = $_POST['email']   ?? '';
  $phone   = $_POST['phone']   ?? '';
  $address = $_POST['address'] ?? '';
  $amount  = $_POST['amount']  ?? '';
  $method  = $_POST['method']  ?? '';

  // === Format message ===
  $subject = "New Order from $name";
  $message = "🛒 NEW ORDER RECEIVED:\n\n"
           . "👤 Name: $name\n"
           . "📧 Email: $email\n"
           . "📱 Phone: $phone\n"
           . "🏠 Address: $address\n"
           . "💵 Amount: $amount GHS\n"
           . "💳 Payment Method: $method\n\n"
           . "📅 Date: " . date("Y-m-d H:i:s");

  // === Set your email ===
  $to = "gadrijasper1@email.com"; // ← CHANGE THIS to your real email

  // === Headers (optional but recommended) ===
  $headers = "From: noreply@gmail.com\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion();

  // === Send the email ===
  if (mail($to, $subject, $message, $headers)) {
    echo "Order received & email sent!";
  } else {
    echo "Order received but email failed!";
  }
}
?>
