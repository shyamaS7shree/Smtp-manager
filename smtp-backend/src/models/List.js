const mongoose = require('mongoose');
const { generateUid } = require('../helpers/uid');

const listSchema = new mongoose.Schema(
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
    // General info
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    description: { type: String, trim: true, default: '' },
    // Email defaults
    fromName: { type: String, default: 'Default Sender' },
    fromEmail: { type: String, default: '' },
    replyTo: { type: String, default: '' },
    subject: { type: String, default: '' },
    // Opt-in / out settings
    optIn: { type: String, enum: ['single', 'double'], default: 'single' },
    optOut: { type: String, enum: ['single', 'double'], default: 'single' },
    // Company details
    companyName: { type: String, default: '' },
    companyCountry: { type: String, default: '' },
    companyAddress1: { type: String, default: '' },
    companyAddress2: { type: String, default: '' },
    companyCity: { type: String, default: '' },
    companyZip: { type: String, default: '' },
    companyPhone: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    // Status
    isArchived: { type: Boolean, default: false },
    // Subscriber counts (updated via aggregation)
    subscribersCount: { type: Number, default: 0 },
    confirmedSubscribersCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Format list for MailWizz-compatible response
listSchema.methods.toMailWizzFormat = function () {
  return {
    uid: this.uid,
    general: {
      list_uid: this.uid,
      name: this.name,
      display_name: this.displayName || this.name,
      description: this.description,
      opt_in: this.optIn,
      opt_out: this.optOut,
      from_name: this.fromName,
      from_email: this.fromEmail,
      reply_to: this.replyTo,
      subject: this.subject,
      is_archived: this.isArchived ? 'yes' : 'no',
    },
    company: {
      name: this.companyName,
      country: this.companyCountry,
      address_1: this.companyAddress1,
      address_2: this.companyAddress2,
      city: this.companyCity,
      zip_code: this.companyZip,
      phone: this.companyPhone,
      website: this.companyWebsite,
    },
    stats: {
      subscribers: { total: this.subscribersCount, confirmed: this.confirmedSubscribersCount },
    },
    date_added: this.createdAt,
  };
};

module.exports = mongoose.model('List', listSchema);
