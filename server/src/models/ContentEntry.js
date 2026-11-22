// Defines the MongoDB schema and model for managed CMS content.
import mongoose from 'mongoose'

const contentEntrySchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ['services', 'case-studies', 'industries', 'insights', 'testimonials', 'faqs'],
      required: true,
    },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    summary: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    image: {
      url: { type: String, trim: true, maxlength: 500 },
      alt: { type: String, trim: true, maxlength: 300 },
    },
    seo: {
      title: { type: String, trim: true, maxlength: 180 },
      description: { type: String, trim: true, maxlength: 500 },
      canonicalUrl: { type: String, trim: true, maxlength: 500 },
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true, minimize: false },
)

contentEntrySchema.index({ contentType: 1, slug: 1 }, { unique: true })
contentEntrySchema.index({ contentType: 1, status: 1, updatedAt: -1 })

export const ContentEntry = mongoose.model('ContentEntry', contentEntrySchema)
