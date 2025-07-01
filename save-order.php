<?php
// Allow CORS if needed
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
if (!$data || !isset($data['id'])) {
  echo json_encode(["success" => false, "message" => "Invalid data"]);
  exit;
}

// Read existing orders
$file = 'orders.json';
$orders = file_exists($file) ? json_decode(file_get_contents($file), true) : [];

// Add new order
$orders[] = $data;

// Save back to file
file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));

echo json_encode(["success" => true, "message" => "Order saved"]);
