// Configures API middleware, routes, static assets, and request error handling.
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import authRouter from './routes/auth.js'
import contactRouter from './routes/contact.js'
import contentRouter from './routes/content.js'
import healthRouter from './routes/health.js'
import servicesRouter from './routes/services.js'

const app = express()
const serverDirectory = dirname(fileURLToPath(import.meta.url))
const clientDist = resolve(serverDirectory, '../../client/dist')

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", 'https://www.googletagmanager.com'],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
      'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
      'frame-src': ['https://www.googletagmanager.com'],
    },
  },
}))
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '30kb' }))
app.use(cookieParser())

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please wait before trying again.' },
}))
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/services', servicesRouter)
app.use('/api/content', contentRouter)
app.use('/api/contact', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many enquiries were sent. Please wait and try again.' },
}))
app.use('/api/contact', contactRouter)

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' })
})

app.use(express.static(clientDist, {
  index: 'index.html',
  // Applies immutable caching to bundled assets and revalidation to other files.
  setHeaders(res, filePath) {
    if (filePath.includes(`${resolve(clientDist, 'assets')}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    }
  },
}))
// Serves the client application for non-API browser routes.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
  return res.sendFile(resolve(clientDist, 'index.html'), (error) => {
    if (error) next(error)
  })
})

// Converts known database errors and unexpected failures into API responses.
app.use((error, _req, res, _next) => {
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'A service with these details already exists.' })
  }
  if (error?.name === 'ValidationError' || error?.name === 'CastError') {
    return res.status(400).json({ message: 'The submitted data is invalid.' })
  }
  console.error('Request failed:', error)
  return res.status(500).json({ message: 'The request could not be completed. Please try again.' })
})

export default app
