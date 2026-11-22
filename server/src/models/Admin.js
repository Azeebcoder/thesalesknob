// Defines the MongoDB schema and model for administrator and editor accounts.
import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
  },
  { timestamps: true },
)

export const Admin = mongoose.model('Admin', adminSchema)
