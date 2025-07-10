const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add these settings to improve deliverability
  tls: {
    rejectUnauthorized: false
  },
  // Add DKIM and SPF headers
  headers: {
    'X-Priority': '1',
    'X-MSMail-Priority': 'High',
    'Importance': 'high'
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Captain's Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      // Add headers to reduce spam filtering
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Captain\'s Ledger Bot'
      },
      // Add text version for better deliverability
      text: html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to:', to);
    console.log('📧 Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};

module.exports = sendEmail;
