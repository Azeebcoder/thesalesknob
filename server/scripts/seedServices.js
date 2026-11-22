// Inserts the initial service catalog while preserving existing administrator edits.
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectMongo } from '../src/db/connect.js'
import { Service } from '../src/models/Service.js'
import { initialServices } from '../src/data/serviceCatalog.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(scriptDirectory, '../.env') })

try {
  await connectMongo()
  for (const [index, item] of initialServices.entries()) {
    const { categoryOrder, sortOrder, ...service } = item
    const slug = `${item.category}-${item.name}`
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    await Service.updateOne(
      { slug },
      {
        $setOnInsert: { ...service, slug },
        $set: { categoryOrder, sortOrder: index },
      },
      { upsert: true },
    )
  }
  console.log(`Seeded ${initialServices.length} service estimates (existing admin edits were preserved).`)
} catch (error) {
  console.error('Service seeding failed:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
