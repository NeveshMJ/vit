const nodemailer = require('nodemailer');

// ============================================================
// TRANSPORTER CONFIG — Gmail with pooling, retries & timeouts
// ============================================================
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('[Mailer] WARNING: EMAIL_USER or EMAIL_PASS not set in .env — emails will fail!');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,            // reuse connections for multiple sends
  maxConnections: 3,     // max simultaneous connections
  maxMessages: 50,       // per connection before reconnect
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: true  // enforce valid TLS certificates
  },
  connectionTimeout: 10000,   // 10s to establish connection
  greetingTimeout: 10000,     // 10s for SMTP greeting
  socketTimeout: 15000        // 15s for socket inactivity
});

// Verify SMTP connection on startup (non-blocking)
transporter.verify()
  .then(() => console.log('[Mailer] SMTP connection verified — ready to send emails'))
  .catch(err => console.error('[Mailer] SMTP verification failed:', err.message));

// ============================================================
// RETRY HELPER — retries transient failures with exponential backoff
// ============================================================
const MAX_EMAIL_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1500;

async function sendMailWithRetry(mailOptions, context = 'email') {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_EMAIL_RETRIES + 1; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Mailer] ${context} sent to ${mailOptions.to} (messageId: ${info.messageId}, attempt: ${attempt})`);
      return info;
    } catch (error) {
      lastError = error;
      const code = error.code || error.responseCode || '';
      console.warn(`[Mailer] ${context} attempt ${attempt} failed: ${error.message} (code: ${code})`);

      // Don't retry on permanent failures (auth errors, invalid recipient, etc.)
      const permanentCodes = ['EAUTH', 'EENVELOPE', 535, 550, 551, 552, 553, 554];
      const isPermanent = permanentCodes.some(c =>
        code === c || code === String(c) || error.message?.includes(String(c))
      );
      if (isPermanent) {
        console.error(`[Mailer] Permanent failure for ${context} — not retrying`);
        break;
      }

      // Wait before retrying with exponential backoff
      if (attempt <= MAX_EMAIL_RETRIES) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[Mailer] Retrying ${context} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries exhausted — throw the last error
  throw lastError;
}

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

const sendOTP = async (email, otp) => {
  if (!email) throw new Error('Recipient email is required');

  const mailOptions = {
    from: `"GRIEVEX Portal" <${EMAIL_USER}>`,
    to: email,
    subject: 'GRIEVEX — Your Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8faff; border-radius: 16px; overflow: hidden; border: 1px solid #dbeafe;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #0ea5e9 100%); padding: 32px 40px 28px; text-align: center;">
          <div style="width: 52px; height: 52px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 24px; font-weight: 900; color: white;">GX</span>
          </div>
          <h2 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">GRIEVEX Portal</h2>
          <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 14px;">Tamil Nadu Civic Grievance Resolution</p>
        </div>
        <!-- Body -->
        <div style="padding: 36px 40px;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 10px; font-weight: 600;">Verification Code</p>
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 28px; line-height: 1.6;">
            Use the code below to verify your identity. This code expires in <strong>5 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="text-align: center; margin: 0 0 28px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 14px; padding: 20px 40px;">
              <span style="font-size: 44px; font-weight: 900; color: #1e3a8a; letter-spacing: 14px; font-family: 'Courier New', monospace;">${otp}</span>
            </div>
          </div>

          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 28px;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">⚠️ <strong>Do not share this code</strong> with anyone. GRIEVEX will never ask for your code via phone or email.</p>
          </div>

          <p style="font-size: 13px; color: #9ca3af; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 18px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">&copy; 2026 GRIEVEX · Government of Tamil Nadu · All rights reserved</p>
        </div>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions, `OTP to ${email}`);
};

const sendProviderCredentials = async (email, name, password, department) => {
  if (!email) throw new Error('Recipient email is required');

  const mailOptions = {
    from: `"GRIEVEX Portal" <${EMAIL_USER}>`,
    to: email,
    subject: 'GRIEVEX - Service Provider Account Created',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #1e3a8a; border-radius: 10px;">
        <h2 style="color: #1e3a8a; text-align: center;">Tamil Nadu Service Management Portal</h2>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p>Your Service Provider account has been created for the <strong>${department}</strong> department.</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Department:</strong> ${department}</p>
        </div>
        <p style="font-size: 14px; color: #666;">Please log in at the GRIEVEX Portal to start resolving complaints.</p>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 GRIEVEX - Government of Tamil Nadu</p>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions, `Credentials to ${email}`);
};

// Notify provider of new complaint assignment
const sendComplaintAssignment = async (providerEmail, providerName, complaint) => {
  if (!providerEmail) throw new Error('Provider email is required');

  const mailOptions = {
    from: `"GRIEVEX Portal" <${EMAIL_USER}>`,
    to: providerEmail,
    subject: `GRIEVEX - New Complaint Assigned: ${complaint.ticketId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #1e3a8a; border-radius: 10px;">
        <h2 style="color: #1e3a8a; text-align: center;">Tamil Nadu Service Management Portal</h2>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${providerName}</strong>,</p>
        <p>A new complaint has been assigned to you.</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Ticket ID:</strong> ${complaint.ticketId}</p>
          <p><strong>Department:</strong> ${complaint.department}</p>
          <p><strong>Area:</strong> ${complaint.area}</p>
          <p><strong>Priority:</strong> <span style="color: ${complaint.priority === 'Critical' ? '#c62828' : complaint.priority === 'High' ? '#0ea5e9' : '#1565c0'}; font-weight: bold;">${complaint.priority}</span></p>
          <p><strong>Description:</strong> ${complaint.description.substring(0, 200)}${complaint.description.length > 200 ? '...' : ''}</p>
          ${complaint.address ? `<p><strong>Location:</strong> ${complaint.address}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666;">Please log in to the GRIEVEX Portal to accept and resolve this complaint.</p>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 GRIEVEX - Government of Tamil Nadu</p>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions, `Assignment ${complaint.ticketId} to ${providerEmail}`);
};

// Notify user about complaint status update
const sendStatusUpdate = async (userEmail, userName, complaint, newStatus, note) => {
  if (!userEmail) throw new Error('User email is required');

  const statusEmoji = {
    'Registered': '&#128203;',
    'Accepted': '&#9989;',
    'Working On': '&#128295;',
    'Completed': '&#127881;',
    'Rejected': '&#10060;'
  };

  const mailOptions = {
    from: `"GRIEVEX Portal" <${EMAIL_USER}>`,
    to: userEmail,
    subject: `GRIEVEX - Complaint ${complaint.ticketId} Status Update: ${newStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 2px solid #1e3a8a; border-radius: 10px;">
        <h2 style="color: #1e3a8a; text-align: center;">Tamil Nadu Service Management Portal</h2>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${userName}</strong>,</p>
        <p>Your complaint status has been updated:</p>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Ticket ID:</strong> ${complaint.ticketId}</p>
          <p><strong>New Status:</strong> ${statusEmoji[newStatus] || ''} <strong>${newStatus}</strong></p>
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
          ${complaint.assignedToName ? `<p><strong>Handled by:</strong> ${complaint.assignedToName}</p>` : ''}
        </div>
        <p style="font-size: 14px; color: #666;">Log in to the GRIEVEX Portal to view full details.</p>
        <hr style="border: 1px solid #e0e0e0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 GRIEVEX - Government of Tamil Nadu</p>
      </div>
    `
  };

  return sendMailWithRetry(mailOptions, `Status update ${complaint.ticketId} to ${userEmail}`);
};

module.exports = { sendOTP, sendProviderCredentials, sendComplaintAssignment, sendStatusUpdate };

