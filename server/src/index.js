// Loads server configuration, connects to MongoDB, and manages the API process.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectMongo } from './db/connect.js'

const serverDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(serverDirectory, '../.env') })
const { default: app } = await import('./app.js')

// Validates runtime configuration, starts the API listener, and handles shutdown.
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET is required and must contain at least 32 characters.')
  }
  await connectMongo()

  const port = Number(process.env.PORT || 5000)
  const server = createServer(app)
  // Logs the address after the API begins listening.
  server.listen(port, () => {
    console.log(`TSK API listening on http://localhost:${port}`)
  })

  // Closes the HTTP listener and MongoDB connection after a termination signal.
  const shutdown = (signal) => {
    console.log(`${signal} received. Closing the API server.`)
    // Completes shutdown after active connections close.
    server.close(async (error) => {
      if (error) {
        console.error('Error closing the API server:', error)
        process.exitCode = 1
      }
      await mongoose.disconnect()
    })
  }
  // Registers graceful shutdown handlers for common process termination signals.
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

// Reports startup failures and marks the process as unsuccessful.
start().catch((error) => {
  console.error('API startup failed:', error.message)
  process.exitCode = 1
})
