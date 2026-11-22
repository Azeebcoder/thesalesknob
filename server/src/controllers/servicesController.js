// Implements public service listings and administrator-managed pricing.
import { z } from 'zod'
import { Service } from '../models/Service.js'

const serviceSchema = z.object({
  category: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(140),
  priceLabel: z.string().trim().min(1).max(100),
})

// Converts service names into URL-safe identifiers.
function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// Validates service input and sends a client error for invalid data.
function parseService(body, res) {
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Provide a service area, name, and indicative price.' })
    return null
  }
  return parsed.data
}

// Returns the ordered public service catalog.
export async function listServices(_req, res) {
  const services = await Service.find().sort({ categoryOrder: 1, sortOrder: 1, category: 1, name: 1 }).lean()
  return res.json({ services })
}

// Creates a service listing for administrators.
export async function createService(req, res) {
  const data = parseService(req.body, res)
  if (!data) return
  const slug = `${slugify(data.category)}-${slugify(data.name)}`
  const service = await Service.create({ ...data, slug, categoryOrder: 9999, sortOrder: 0 })
  return res.status(201).json({ service })
}

// Updates an existing service listing for administrators.
export async function updateService(req, res) {
  const data = parseService(req.body, res)
  if (!data) return
  const slug = `${slugify(data.category)}-${slugify(data.name)}`
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { ...data, slug },
    { new: true, runValidators: true },
  )
  if (!service) return res.status(404).json({ message: 'Service not found.' })
  return res.json({ service })
}

// Removes a service listing for administrators.
export async function deleteService(req, res) {
  const service = await Service.findByIdAndDelete(req.params.id)
  if (!service) return res.status(404).json({ message: 'Service not found.' })
  return res.json({ message: 'Service removed.' })
}
