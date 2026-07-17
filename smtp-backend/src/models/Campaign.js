const mongoose = require('mongoose');
const { generateUid } = require('../helpers/uid');

const campaignSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['regular', 'autoresponder', 'abtest'],
      default: 'regular',
    },
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    subject: { type: String, required: true },
    replyTo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'pending-sending', 'sending', 'sent', 'paused', 'blocked'],
      default: 'draft',
    },
    // List association
    listUid: { type: String, default: '' },
    segmentUid: { type: String, default: '' },
    // Template and content
    templateUid: { type: String, default: '' },
    content: { type: String, default: '' },
    plainTextEmail: { type: String, default: '' },
    // Schedule
    sendAt: { type: Date },
    // Options
    urlTracking: { type: String, enum: ['yes', 'no'], default: 'yes' },
    inlineCss: { type: String, enum: ['yes', 'no'], default: 'yes' },
    archive: { type: String, enum: ['yes', 'no'], default: 'no' },
    autoPlainText: { type: String, enum: ['yes', 'no'], default: 'yes' },
    jsonFeed: { type: String, default: 'no' },
    xmlFeed: { type: String, default: 'no' },
    // Stats
    stats: {
      totalSubscribers: { type: Number, default: 0 },
      processedSubscribers: { type: Number, default: 0 },
      openCount: { type: Number, default: 0 },
      uniqueOpenCount: { type: Number, default: 0 },
      clickCount: { type: Number, default: 0 },
      uniqueClickCount: { type: Number, default: 0 },
      bounceCount: { type: Number, default: 0 },
      unsubscribeCount: { type: Number, default: 0 },
      openRate: { type: Number, default: 0 },
      clickRate: { type: Number, default: 0 },
    },
    sentAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Format for MailWizz-compatible response
campaignSchema.methods.toMailWizzFormat = function () {
  return {
    campaign_uid: this.uid,
    campaign_id: this._id,
    name: this.name,
    type: this.type,
    status: this.status,
    from_name: this.fromName,
    from_email: this.fromEmail,
    to_name: '',
    reply_to: this.replyTo,
    subject: this.subject,
    send_at: this.sendAt,
    sent_at: this.sentAt,
    list: { list_uid: this.listUid },
    segment: this.segmentUid ? { segment_uid: this.segmentUid } : null,
    template: { template_uid: this.templateUid },
    stats: {
      total_subscribers: this.stats.totalSubscribers,
      processed_subscribers: this.stats.processedSubscribers,
      opens_count: this.stats.openCount,
      unique_opens: this.stats.uniqueOpenCount,
      clicks_count: this.stats.clickCount,
      unique_clicks: this.stats.uniqueClickCount,
      bounces_count: this.stats.bounceCount,
      unsubscribes_count: this.stats.unsubscribeCount,
      open_rate: `${this.stats.openRate.toFixed(2)}%`,
      click_rate: `${this.stats.clickRate.toFixed(2)}%`,
    },
    date_added: this.createdAt,
  };
};

module.exports = mongoose.model('Campaign', campaignSchema);
