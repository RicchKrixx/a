<?php
// Ensure orders.json exists
$filename = 'orders.json';
if (!file_exists($filename)) { file_put_contents($filename, '[]'); }

// Build order array from POST
$order = [
  'name'    => $_POST['custName']   ?? '',
  'email'   => $_POST['custEmail']  ?? '',
  'phone'   => $_POST['custPhone']  ?? '',
  'address' => $_POST['custAddr']   ?? '',
  'payment' => $_POST['payMethod']  ?? '',
  'total'   => $_POST['grandTotal'] ?? '0',
  'time'    => date('Y-m-d H:i:s')
];

// Append order
$orders = json_decode(file_get_contents($filename), true);
$orders[] = $order;
file_put_contents($filename, json_encode($orders, JSON_PRETTY_PRINT));

header('Location: thankyou.html');
exit;
?>
