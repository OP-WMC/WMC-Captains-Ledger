const Announcement = require('../models/Announcement');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Post a new announcement (admin only)
exports.postAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    const { title, body, important } = req.body;
    const author = req.user.name || req.user.email;
    const announcement = await Announcement.create({
      title,
      body,
      important,
      author,
    });

    // If important, send email to all users
    if (important) {
      const users = await User.find({}, 'email');
      const emails = users.map(u => u.email).filter(Boolean);
      if (emails.length > 0) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Important Announcement</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                border-radius: 15px; 
                overflow: hidden; 
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              }
              .header { 
                background: linear-gradient(135deg, #ff6b6b, #ee5a24); 
                color: white; 
                padding: 30px; 
                text-align: center;
              }
              .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .content { 
                padding: 40px 30px; 
                background: white;
              }
              .announcement-title { 
                color: #2c3e50; 
                font-size: 24px; 
                font-weight: 600; 
                margin-bottom: 20px;
                border-left: 4px solid #e74c3c;
                padding-left: 15px;
              }
              .announcement-body { 
                color: #34495e; 
                font-size: 16px; 
                line-height: 1.6; 
                margin-bottom: 25px;
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid #e9ecef;
              }
              .important-badge { 
                display: inline-block; 
                background: #e74c3c; 
                color: white; 
                padding: 8px 16px; 
                border-radius: 20px; 
                font-size: 14px; 
                font-weight: 600; 
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .footer { 
                background: #2c3e50; 
                color: white; 
                padding: 20px 30px; 
                text-align: center; 
                font-size: 14px;
              }
              .footer a { 
                color: #3498db; 
                text-decoration: none; 
              }
              .logo { 
                font-size: 18px; 
                font-weight: 700; 
                margin-bottom: 10px;
                color: #f39c12;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🦅 Captain's Ledger</div>
                <h1>Important Announcement</h1>
              </div>
              <div class="content">
                <div class="important-badge">⚠️ Important</div>
                <div class="announcement-title">${title}</div>
                <div class="announcement-body">${body}</div>
                <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                  <strong>Posted by:</strong> ${author}<br>
                  <strong>Date:</strong> ${new Date().toLocaleDateString()}
                </p>
              </div>
              <div class="footer">
                <p>This is an important announcement from Captain's Ledger.</p>
                <p>Please check your dashboard for more details.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        await sendEmail({
          to: emails,
          subject: `🚨 Important Announcement: ${title}`,
          html: emailHtml
        });
      }
    }
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}; 