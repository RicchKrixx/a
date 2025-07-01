<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $name = $_POST["name"] ?? '';
  $email = $_POST["email"] ?? '';
  $phone = $_POST["phone"] ?? '';
  $address = $_POST["address"] ?? '';
  $payment = $_POST["payment"] ?? '';
  $total = $_POST["total"] ?? '0';

  $msg = "New Order from $name\n";
  $msg .= "Email: $email\nPhone: $phone\nAddress: $address\nPayment: $payment\nTotal: $total";

  mail("you@example.com", "New Order - BizMAX", $msg);
}
?>
