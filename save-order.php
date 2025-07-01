<?php
// === Settings ===
$admin_email = "gadrijasper1@gmail.com";  // <- CHANGE THIS to your real email
$file_path = "orders.json";       // <- Where orders are stored

// === Get POST data ===
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
  http_response_code(400);
  echo json_encode(["status" => "error", "message" => "Invalid data."]);
  exit;
}

// === Generate Order ID ===
$order_id = strtoupper(uniqid("BXM-"));

// === Add Order ID & Timestamp ===
$data["order_id"] = $order_id;
$data["created_at"] = date("Y-m-d H:i:s");

// === Save Order to File ===
$orders = file_exists($file_path) ? json_decode(file_get_contents($file_path), true) : [];
$orders[] = $data;
file_put_contents($file_path, json_encode($orders, JSON_PRETTY_PRINT));

// === Send Email Notification ===
$subject = "\xF0\x9F\x93\xA6 New Order Received: $order_id";
$body = "You have a new order:\n\n";
$body .= "Order ID: $order_id\n";
$body .= "Name: " . $data['name'] . "\n";
$body .= "Email: " . $data['email'] . "\n";
$body .= "Phone: " . $data['phone'] . "\n";
$body .= "Address: " . $data['address'] . "\n";
$body .= "Payment Method: " . $data['payment'] . "\n";
$body .= "Date: " . $data['created_at'] . "\n\n";

$body .= "Items:\n";
foreach ($data['items'] as $item) {
  $body .= "- " . $item['name'] . " (Qty: " . $item['qty'] . ", Price: $" . $item['price'] . ")\n";
}

$body .= "\nTotal: $" . $data['total'] . "\n";

$headers = "From: noreply@BixMAX.com";  // <- Change to your domain

// Send mail (ensure mail() works on your server)
mail($admin_email, $subject, $body, $headers);

// === Success Response ===
echo json_encode(["status" => "success", "order_id" => $order_id]);
