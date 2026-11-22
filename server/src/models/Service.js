// Defines the MongoDB schema and model for service pricing entries.
import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    priceLabel: { type: String, required: true, trim: true, maxlength: 100 },
    categoryOrder: { type: Number, default: 9999 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

serviceSchema.index({ categoryOrder: 1, sortOrder: 1, category: 1 })

export const Service = mongoose.model('Service', serviceSchema)
