<?php
/*----------------------------------------------------------
  Simple Order-ID lookup  (GET /track-order.php?id=YOUR_ID)
  - reads orders.json
  - returns JSON  { status:"found", order:{…} } | { status:"not_found" }
----------------------------------------------------------*/
header('Content-Type: application/json');

$ordersFile = 'orders.json';          // same file save_order.php writes
$orderId    = $_GET['id'] ?? '';

if (!$orderId || !file_exists($ordersFile)) {
  echo json_encode(['status'=>'not_found']); 
  exit;
}

$orders = json_decode(file_get_contents($ordersFile), true);

foreach ($orders as $o) {
  if (isset($o['order_id']) && $o['order_id'] === $orderId) {
    echo json_encode(['status'=>'found','order'=>$o]);
    exit;
  }
}

echo json_encode(['status'=>'not_found']);
