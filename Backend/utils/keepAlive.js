const https = require('https');
const http = require('http');
const User = require('../models/User');

/**
 * Periodically pings the application's external URL and queries MongoDB to prevent inactive sleep.
 */
function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  
  // Set interval to 10 minutes (600,000 milliseconds)
  const INTERVAL = 10 * 60 * 1000;

  console.log('Keep-alive background service initialized.');

  setInterval(async () => {
    // 1. Keep MongoDB active by performing a lightweight query
    try {
      await User.findOne().select('_id');
      console.log('Keep-alive: Database query completed successfully.');
    } catch (dbErr) {
      console.error('Keep-alive: Database query failed:', dbErr.message);
    }

    // 2. Keep Render Web Service active by pinging the public URL
    if (!url) {
      return;
    }

    try {
      const pingUrl = `${url.replace(/\/$/, '')}/api/health`;
      const client = pingUrl.startsWith('https') ? https : http;

      client.get(pingUrl, (res) => {
        console.log(`Keep-alive: Self-ping to ${pingUrl} returned status code ${res.statusCode}.`);
      }).on('error', (err) => {
        console.error('Keep-alive: Self-ping request encountered an error:', err.message);
      });
    } catch (pingErr) {
      console.error('Keep-alive: Self-ping failed to send:', pingErr.message);
    }
  }, INTERVAL);
}

module.exports = startKeepAlive;
