const imap = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const pool = require('../config/db');

/**
 * Connects to IMAP, reads unread emails, looks for delivery failures,
 * and extracts the original recipient email to mark as a bounce.
 */
async function processBounces() {
  if (!process.env.BOUNCE_IMAP_HOST || !process.env.BOUNCE_IMAP_USER || !process.env.BOUNCE_IMAP_PASS) {
    console.warn("⚠️ Bounce tracking skipped: IMAP credentials not set in .env");
    return;
  }

  const config = {
    imap: {
      user: process.env.BOUNCE_IMAP_USER,
      password: process.env.BOUNCE_IMAP_PASS,
      host: process.env.BOUNCE_IMAP_HOST,
      port: process.env.BOUNCE_IMAP_PORT || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }, // Often needed for custom mail servers
      authTimeout: 10000
    }
  };

  try {
    const connection = await imap.connect(config);
    await connection.openBox('INBOX');

    // Search for unread emails (which should be bounce notifications)
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

    const results = await connection.search(searchCriteria, fetchOptions);
    console.log(`📬 Found ${results.length} unread bounce messages.`);

    for (const item of results) {
      try {
        const all = item.parts.find(part => part.which === 'TEXT');
        const header = item.parts.find(part => part.which === 'HEADER');
        const id = item.attributes.uid;
        const idHeader = "Imap-Id: "+id+"\r\n";

        // Parse the raw email
        const mail = await simpleParser(idHeader + header.body + all.body);
        const subject = mail.subject ? mail.subject.toLowerCase() : '';
        const text = mail.text ? mail.text.toLowerCase() : '';

        // Check if this looks like a bounce message
        if (
          subject.includes('delivery failure') || 
          subject.includes('undelivered mail') || 
          subject.includes('returned to sender') ||
          text.includes('could not be delivered') ||
          text.includes('mailbox is full') ||
          text.includes('user unknown')
        ) {
          
          // Extract the failed email address using regex
          // Bounces usually contain lines like "To: <failed@email.com>" or "Failed Recipient: failed@email.com"
          let bouncedEmail = null;
          
          // 1. Try to find diagnostic code or Final-Recipient
          const finalRecipientMatch = text.match(/final-recipient:\s*rfc822;\s*([^\s]+)/i);
          if (finalRecipientMatch) {
            bouncedEmail = finalRecipientMatch[1];
          }

          // 2. Look for common bounce formats
          if (!bouncedEmail) {
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
            const emails = text.match(emailRegex);
            
            // Filter out the bounce user itself
            if (emails && emails.length > 0) {
              bouncedEmail = emails.find(e => e.toLowerCase() !== process.env.BOUNCE_IMAP_USER.toLowerCase());
            }
          }

          if (bouncedEmail) {
            bouncedEmail = bouncedEmail.replace(/[<>\s]/g, '').toLowerCase();
            console.log(`❌ Bounce detected for: ${bouncedEmail}`);

            // Mark in Database
            // Increment bounces in campaigns (we need to know which campaign. 
            // Bounces don't always say which campaign, so we find the latest campaign sent to this user)
            
            // 1. Update subscriber status
            await pool.query(
              `UPDATE subscribers SET status = 'bounced', updated_at = NOW() WHERE email = $1`,
              [bouncedEmail]
            );

            // 2. Try to increment bounce count for the most recent campaign sent to them
            // This is a best-effort approach since generic bounces strip custom headers.
            const { rows } = await pool.query(
              `SELECT list_uid FROM subscribers WHERE email = $1 LIMIT 1`,
              [bouncedEmail]
            );

            if (rows.length > 0) {
               const listUid = rows[0].list_uid;
               // Find latest campaign for this list
               await pool.query(
                 `UPDATE campaigns 
                  SET bounces = COALESCE(bounces, 0) + 1 
                  WHERE list_uid = $1 
                  AND id IN (
                    SELECT id FROM campaigns WHERE list_uid = $1 ORDER BY sent_at DESC LIMIT 1
                  )`,
                 [listUid]
               );
            }
          }
        }
        
        // Delete the bounce email to keep inbox clean
        await connection.addFlags(item.attributes.uid, '\\Deleted');
      } catch (err) {
        console.error("Error processing individual bounce message:", err);
      }
    }

    connection.end();
  } catch (error) {
    console.error("💥 IMAP Bounce Processor Error:", error.message);
  }
}

// Start a cron-like interval (runs every 15 minutes)
function startBounceProcessor() {
  console.log("🔄 Bounce Processor started (runs every 15 mins)");
  // Run immediately on boot
  processBounces();
  
  // 15 minutes = 15 * 60 * 1000 = 900000 ms
  setInterval(processBounces, 900000);
}

module.exports = { startBounceProcessor, processBounces };
