<?php
/**
 * Funds Guru - cPanel Webmail Form Dispatcher (mail.php)
 * Forwards all form submissions directly to info@fundsguru.in
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// Target Webmail Recipient
$WEBMAIL_RECIPIENT = 'info@fundsguru.in';

// Read JSON input or POST form fields
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

// Extract & sanitize fields
$name           = isset($data['name']) ? trim(strip_tags($data['name'])) : '';
$email          = isset($data['email']) ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : '';
$phone          = isset($data['phone']) ? trim(strip_tags($data['phone'])) : '';
$service        = isset($data['service']) ? trim(strip_tags($data['service'])) : 'General Inquiry';
$subject        = isset($data['subject']) ? trim(strip_tags($data['subject'])) : "Inquiry from $name - Funds Guru";
$message        = isset($data['message']) ? trim(strip_tags($data['message'])) : 'No additional message provided';
$urgency        = isset($data['urgency']) ? trim(strip_tags($data['urgency'])) : 'Standard';
$bankName       = isset($data['bankName']) ? trim(strip_tags($data['bankName'])) : '';
$noticeType     = isset($data['noticeType']) ? trim(strip_tags($data['noticeType'])) : '';
$disputedAmount = isset($data['disputedAmount']) ? trim(strip_tags($data['disputedAmount'])) : '';
$loanAmount     = isset($data['loanAmount']) ? trim(strip_tags($data['loanAmount'])) : '';

// Validation
if (empty($name) || (empty($email) && empty($phone))) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide your full name and at least one contact channel (phone or email).'
    ]);
    exit;
}

$refId = 'FG-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
$timestamp = date('d M Y, h:i A') . ' IST';
$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';

// Build HTML email for Webmail
$htmlBody = '
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 25px; color: #1e293b; }
  .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border-top: 6px solid #0f172a; }
  .email-header { background: #0f172a; color: #ffffff; padding: 28px 32px; }
  .email-header h1 { margin: 0; font-size: 22px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px; }
  .email-header p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-top: 10px; }
  .badge-urgent { background: #fee2e2; color: #b91c1c; }
  .badge-std { background: #e0f2fe; color: #0284c7; }
  .email-body { padding: 32px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .info-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .label-col { width: 35%; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .value-col { width: 65%; color: #0f172a; font-size: 15px; font-weight: 600; }
  .value-col a { color: #2563eb; text-decoration: none; }
  .message-block { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #334155; margin-top: 10px; }
  .email-footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
</style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Funds Guru - Client Webmail Lead</h1>
      <p>Ref ID: ' . $refId . ' &bull; ' . $timestamp . '</p>
      ' . ($urgency === 'Urgent' || $urgency === 'Critical' ? '<span class="badge badge-urgent">&#9888; Urgent Priority</span>' : '<span class="badge badge-std">Standard Inquiry</span>') . '
    </div>
    <div class="email-body">
      <table class="info-table">
        <tr>
          <td class="label-col">Client Name</td>
          <td class="value-col">' . htmlspecialchars($name) . '</td>
        </tr>
        <tr>
          <td class="label-col">Phone / WhatsApp</td>
          <td class="value-col"><a href="tel:' . htmlspecialchars($phone) . '">' . htmlspecialchars($phone) . '</a></td>
        </tr>
        <tr>
          <td class="label-col">Email Address</td>
          <td class="value-col"><a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a></td>
        </tr>
        <tr>
          <td class="label-col">Service Category</td>
          <td class="value-col">' . htmlspecialchars($service) . '</td>
        </tr>';

if (!empty($bankName)) {
    $htmlBody .= '
        <tr>
          <td class="label-col">Bank / Notice</td>
          <td class="value-col">' . htmlspecialchars($bankName) . (!empty($noticeType) ? ' (' . htmlspecialchars($noticeType) . ')' : '') . '</td>
        </tr>';
}

if (!empty($disputedAmount)) {
    $htmlBody .= '
        <tr>
          <td class="label-col">Frozen / Disputed Amount</td>
          <td class="value-col">INR ' . htmlspecialchars($disputedAmount) . '</td>
        </tr>';
}

if (!empty($loanAmount)) {
    $htmlBody .= '
        <tr>
          <td class="label-col">Requested Loan Amount</td>
          <td class="value-col">INR ' . htmlspecialchars($loanAmount) . '</td>
        </tr>';
}

$htmlBody .= '
      </table>
      <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Message / Case Summary:</div>
      <div class="message-block">' . nl2br(htmlspecialchars($message)) . '</div>
    </div>
    <div class="email-footer">
      <strong>Funds Guru</strong> &bull; Shop No. 14, First Floor, Jagdambey Market, Near Subway, Basti Jodhewal, Ludhiana, Punjab – 141007<br/>
      Official Webmail: info@fundsguru.in &bull; Client IP: ' . $clientIp . '
    </div>
  </div>
</body>
</html>';

// Setup Email Headers
$mailSubject = "[$urgency Lead] $service: $name (Ref: $refId)";
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = 'From: Funds Guru Web Portal <no-reply@fundsguru.in>';
if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = "Reply-To: $name <$email>";
}
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Send email using PHP mail()
$mailSent = @mail($WEBMAIL_RECIPIENT, $mailSubject, $htmlBody, implode("\r\n", $headers));

// Also record submission in a secure local JSON archive file so no inquiry is ever lost
$logDir = __DIR__ . '/data';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0755, true);
}
$logFile = $logDir . '/webmail_inbox.json';
$existing = [];
if (file_exists($logFile)) {
    $rawLog = @file_get_contents($logFile);
    $existing = json_decode($rawLog, true) ?: [];
}
array_unshift($existing, [
    'id' => $refId,
    'timestamp' => date('c'),
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'service' => $service,
    'urgency' => $urgency,
    'message' => $message,
    'mailSent' => $mailSent
]);
@file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT));

// Return success response to user
echo json_encode([
    'success' => true,
    'message' => "Thank you, $name! Your inquiry has been dispatched to our webmail (info@fundsguru.in). Reference ID: $refId. A Funds Guru specialist will contact you shortly.",
    'referenceId' => $refId
]);
