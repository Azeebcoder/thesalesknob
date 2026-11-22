// Establishes the application's connection to MongoDB.
import mongoose from 'mongoose'

// Connects Mongoose using the configured database URI.
export async function connectMongo() {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI is required. Set it in server/.env before starting the API.')

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 })
}
