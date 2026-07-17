/**
 * Generates a random alphanumeric UID (MailWizz-style).
 * Example: "ab3x9kz12m4qr"
 */
const generateUid = (length = 13) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = { generateUid };
