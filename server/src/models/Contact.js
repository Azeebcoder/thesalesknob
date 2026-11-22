// Defines the MongoDB schema and model for submitted contact enquiries.
import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    company: { type: String, trim: true, maxlength: 140 },
    phone: { type: String, trim: true, maxlength: 40 },
    website: { type: String, trim: true, maxlength: 300 },
    market: { type: String, trim: true, maxlength: 80 },
    platform: { type: String, trim: true, maxlength: 100 },
    challenge: { type: String, required: true, trim: true, maxlength: 3000 },
    budget: { type: String, trim: true, maxlength: 80 },
    attribution: {
      source: { type: String, trim: true, maxlength: 100 },
      medium: { type: String, trim: true, maxlength: 100 },
      campaign: { type: String, trim: true, maxlength: 100 },
      content: { type: String, trim: true, maxlength: 100 },
      term: { type: String, trim: true, maxlength: 100 },
      landingPage: { type: String, trim: true, maxlength: 500 },
      referrer: { type: String, trim: true, maxlength: 500 },
    },
    consent: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ['new', 'reviewed'], default: 'new' },
  },
  { timestamps: true },
)

export const Contact = mongoose.model('Contact', contactSchema)
