const mongoose = require('mongoose');
const { generateUid } = require('../helpers/uid');

const subscriberSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,
      default: () => generateUid(),
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    listUid: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['confirmed', 'unconfirmed', 'unsubscribed', 'blacklisted'],
      default: 'confirmed',
    },
    ipAddress: { type: String, default: '' },
    source: { type: String, default: 'web' },
    // Custom fields (flexible key-value)
    customFields: { type: Map, of: String, default: {} },
    // Tracking
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    bounceCount: { type: Number, default: 0 },
    lastOpenDate: { type: Date },
    lastClickDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index: unique email per list
subscriberSchema.index({ listUid: 1, email: 1 }, { unique: true });

// Format for MailWizz-compatible response
subscriberSchema.methods.toMailWizzFormat = function () {
  return {
    subscriber_uid: this.uid,
    email: this.email,
    ip_address: this.ipAddress,
    source: this.source,
    date_added: this.createdAt,
    status: this.status,
    first_name: this.firstName,
    last_name: this.lastName,
    full_name: `${this.firstName} ${this.lastName}`.trim(),
  };
};

module.exports = mongoose.model('Subscriber', subscriberSchema);
