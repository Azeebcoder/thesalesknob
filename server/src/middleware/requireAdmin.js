// Extracts administrator identity from session cookies and protects admin routes.
import jwt from 'jsonwebtoken'

// Verifies the request's administrator session and returns its identity if valid.
export function getAdminFromRequest(req) {
  const token = req.cookies.tsk_admin
  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (typeof payload !== 'object' || !payload.sub || !payload.email) {
      return null
    }
    return { id: payload.sub, email: payload.email, role: payload.role || 'admin' }
  } catch {
    return null
  }
}

// Requires a valid administrator session before continuing the request.
export function requireAdmin(req, res, next) {
  const admin = getAdminFromRequest(req)
  if (!admin) return res.status(401).json({ message: 'Please sign in as an administrator.' })
  req.admin = admin
  return next()
}

// Creates middleware that also requires the administrator to hold an allowed role.
export function requireRole(...roles) {
  return (req, res, next) => requireAdmin(req, res, () => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Your account does not have permission to perform this action.' })
    }
    return next()
  })
}
