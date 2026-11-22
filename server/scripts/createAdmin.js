// Creates or updates an administrator account from server environment settings.
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectMongo } from '../src/db/connect.js'
import { Admin } from '../src/models/Admin.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(scriptDirectory, '../.env') })

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const role = process.env.ADMIN_ROLE || 'admin'
  if (!email || !password || password.length < 12 || !['admin', 'editor'].includes(role)) {
    throw new Error('Set ADMIN_EMAIL, an ADMIN_PASSWORD of at least 12 characters, and ADMIN_ROLE to admin or editor in server/.env.')
  }

  await connectMongo()
  const passwordHash = await bcrypt.hash(password, 12)
  await Admin.findOneAndUpdate(
    { email },
    { email, passwordHash, role },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  )
  console.log(`Admin account ${email} is ready.`)
} catch (error) {
  console.error('Admin provisioning failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
