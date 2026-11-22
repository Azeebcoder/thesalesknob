// Implements administrator authentication and session management.
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Admin } from '../models/Admin.js'
import { getAdminFromRequest } from '../middleware/requireAdmin.js'

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
})

// Configures the security and expiry options for the admin session cookie.
function sessionCookieOptions() {
  const hours = Number(process.env.ADMIN_SESSION_HOURS || 8)
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: hours * 60 * 60 * 1000,
  }
}

// Authenticates an administrator and issues a signed session cookie.
export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email and password.' })

  const email = parsed.data.email.toLowerCase()
  const admin = await Admin.findOne({ email }).select('+passwordHash')
  if (!admin || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' })
  }

  const token = jwt.sign(
    { email: admin.email, role: admin.role || 'admin' },
    process.env.JWT_SECRET,
    { subject: admin.id, expiresIn: `${Number(process.env.ADMIN_SESSION_HOURS || 8)}h` },
  )
  res.cookie('tsk_admin', token, sessionCookieOptions())
  return res.json({ admin: { id: admin.id, email: admin.email, role: admin.role || 'admin' } })
}

// Returns the administrator identity associated with the current request.
export function getCurrentAdmin(req, res) {
  return res.json({ admin: getAdminFromRequest(req) })
}

// Clears the administrator session cookie.
export function logout(_req, res) {
  res.clearCookie('tsk_admin', sessionCookieOptions())
  return res.json({ message: 'Signed out.' })
}
