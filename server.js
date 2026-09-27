/**
 * Funds Guru - Web Application & Webmail Dispatch Server
 * Handles static hosting, API endpoints, and form data forwarding to webmail (info@fundsguru.in)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const WEBMAIL_RECIPIENT = process.env.WEBMAIL_RECIPIENT || 'info@fundsguru.in';
const DATA_DIR = path.join(__dirname, 'data');
const INBOX_FILE = path.join(DATA_DIR, 'webmail_inbox.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(INBOX_FILE)) {
  fs.writeFileSync(INBOX_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Configure Nodemailer Transporter
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log(`[Funds Guru Server] SMTP Transporter initialized with host: ${process.env.SMTP_HOST}`);
} else {
  console.log(`[Funds Guru Server] Note: SMTP credentials not set in .env. Form submissions will be logged to ${INBOX_FILE} and forwarded via simulated webmail delivery.`);
}

/**
 * Helper to record submission in local webmail storage
 */
function recordSubmission(submission) {
  try {
    const raw = fs.readFileSync(INBOX_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    list.unshift(submission);
    fs.writeFileSync(INBOX_FILE, JSON.stringify(list, null, 2));
  } catch (err) {
    console.error('[Storage Error]', err);
  }
}

/**
 * POST /api/contact
 * Handles General Inquiries, Urgent Cyber Cell cases, and Loan Requests
 */
app.post('/api/contact', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      service,
      subject,
      message,
      urgency,
      bankName,
      noticeType,
      disputedAmount,
      loanAmount,
      formType
    } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name and at least one contact method (email or phone) are required.'
      });
    }

    const timestamp = new Date().toISOString();
    const submissionId = 'FG-' + Date.now().toString(36).toUpperCase();

    const record = {
      id: submissionId,
      timestamp,
      formType: formType || 'general_contact',
      recipient: WEBMAIL_RECIPIENT,
      name,
      email: email || 'Not provided',
      phone: phone || 'Not provided',
      service: service || 'General Consultation',
      subject: subject || `New Inquiry from ${name} - Funds Guru`,
      message: message || 'No message provided',
      urgency: urgency || 'Standard',
      metadata: {
        bankName: bankName || null,
        noticeType: noticeType || null,
        disputedAmount: disputedAmount || null,
        loanAmount: loanAmount || null,
        ip: req.ip || req.headers['x-forwarded-for'] || 'Localhost'
      }
    };

    // Save locally
    recordSubmission(record);
    console.log(`[Funds Guru Webmail] New form submission [${submissionId}] received for ${WEBMAIL_RECIPIENT}:`, record);

    // If SMTP transporter is configured, send actual email to webmail
    if (transporter) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border-top: 5px solid #0f172a; }
            .header { background: #0f172a; color: #ffffff; padding: 24px 30px; text-align: left; }
            .header h1 { margin: 0; font-size: 22px; color: #f8fafc; }
            .header p { margin: 5px 0 0 0; color: #94a3b8; font-size: 13px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-top: 8px; }
            .badge-urgent { background: #fee2e2; color: #991b1b; }
            .badge-std { background: #e0f2fe; color: #0369a1; }
            .body { padding: 30px; }
            .field-group { margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
            .field-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
            .field-value { font-size: 15px; color: #0f172a; font-weight: 500; }
            .message-box { background: #f8fafc; border-left: 4px solid #d97706; padding: 16px; border-radius: 4px; margin-top: 15px; font-size: 14px; line-height: 1.6; }
            .footer { background: #f8fafc; padding: 16px 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Funds Guru - New Client Inquiry</h1>
              <p>Inquiry ID: ${submissionId} &bull; Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
              ${urgency === 'Urgent' || urgency === 'Critical' ? '<span class="badge badge-urgent">Priority: Urgent</span>' : '<span class="badge badge-std">Priority: Standard</span>'}
            </div>
            <div class="body">
              <div class="field-group">
                <div class="field-label">Client Full Name</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field-group">
                <div class="field-label">Email Address</div>
                <div class="field-value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field-group">
                <div class="field-label">Phone / WhatsApp</div>
                <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
              </div>
              <div class="field-group">
                <div class="field-label">Service Required</div>
                <div class="field-value">${service || 'General Financial Advice'}</div>
              </div>
              ${bankName ? `
              <div class="field-group">
                <div class="field-label">Bank Name & Notice Details</div>
                <div class="field-value">${bankName} ${noticeType ? '(' + noticeType + ')' : ''}</div>
              </div>` : ''}
              ${disputedAmount ? `
              <div class="field-group">
                <div class="field-label">Disputed / Frozen Amount</div>
                <div class="field-value">INR ${disputedAmount}</div>
              </div>` : ''}
              ${loanAmount ? `
              <div class="field-group">
                <div class="field-label">Requested Loan Amount</div>
                <div class="field-value">INR ${loanAmount}</div>
              </div>` : ''}
              <div class="field-group">
                <div class="field-label">Detailed Inquiry / Message</div>
                <div class="message-box">${(message || '').replace(/\n/g, '<br/>')}</div>
              </div>
            </div>
            <div class="footer">
              Direct Webmail Dispatcher &bull; Funds Guru &bull; Shop No. 14, Jagdambey Market, Ludhiana, Punjab &bull; Webmail: ${WEBMAIL_RECIPIENT}
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Funds Guru Portal" <${process.env.SMTP_USER || 'no-reply@fundsguru.in'}>`,
        to: WEBMAIL_RECIPIENT,
        replyTo: email && email.includes('@') ? email : undefined,
        subject: `[${urgency === 'Urgent' ? 'URGENT ' : ''}Inquiry] ${service || 'Lead'}: ${name} - Funds Guru`,
        text: `New inquiry from ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`,
        html: emailHtml
      });
      console.log(`[Funds Guru Server] Email successfully delivered to webmail: ${WEBMAIL_RECIPIENT}`);
    }

    return res.status(200).json({
      success: true,
      message: `Thank you, ${name}! Your inquiry has been dispatched directly to our webmail (${WEBMAIL_RECIPIENT}). Our senior consultant will connect with you within 2 hours.`,
      referenceId: submissionId
    });
  } catch (error) {
    console.error('[Webmail Dispatch Error]', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your message. Please contact us directly at info@fundsguru.in or via WhatsApp.'
    });
  }
});

/**
 * GET /api/webmail-inbox
 * View logged submissions (Useful for testing & verification)
 */
app.get('/api/webmail-inbox', (req, res) => {
  try {
    const raw = fs.readFileSync(INBOX_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    res.json({
      recipient: WEBMAIL_RECIPIENT,
      totalCount: list.length,
      submissions: list
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read inbox' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Funds Guru Official Web Application & Webmail Server `);
  console.log(` Listening on: http://localhost:${PORT}`);
  console.log(` Form submissions target: ${WEBMAIL_RECIPIENT}`);
  console.log(` Local submission archive: ${INBOX_FILE}`);
  console.log(`=======================================================`);
});
