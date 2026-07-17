const mongoose = require('mongoose');
const { generateUid } = require('../helpers/uid');

const templateSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,
      default: () => generateUid(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    plainText: { type: String, default: '' },
    screenshot: { type: String, default: '' },
    category: { type: String, default: 'general' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Format for MailWizz-compatible response
templateSchema.methods.toMailWizzFormat = function () {
  return {
    template_uid: this.uid,
    name: this.name,
    screenshot: this.screenshot || '',
    date_added: this.createdAt,
    is_active: this.isActive ? 'yes' : 'no',
    category: { name: this.category },
    meta: {
      content: this.content,
      plain_text: this.plainText,
    },
  };
};

module.exports = mongoose.model('Template', templateSchema);
