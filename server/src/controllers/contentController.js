// Validates and serves public CMS content and administrator content management.
import { z } from 'zod'
import { ContentEntry } from '../models/ContentEntry.js'

const collections = ['services', 'case-studies', 'industries', 'insights', 'testimonials', 'faqs']
// Treats empty optional text values as omitted before applying string validation.
const optionalText = (limit) => z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().trim().max(limit).optional(),
)
const textList = z.array(z.string().trim().min(1).max(500)).min(1).max(30)
const sectionList = z.array(z.object({
  heading: z.string().trim().min(1).max(180),
  body: z.string().trim().min(1).max(4000),
}).strict()).min(1).max(20)
const collectionData = {
  services: z.object({
    category: z.string().trim().min(1).max(100),
    audience: z.string().trim().min(1).max(1000),
    challenges: textList,
    deliverables: textList,
    channels: textList,
    cta: optionalText(140),
  }).strict(),
  'case-studies': z.object({
    clientLabel: optionalText(180),
    industry: z.string().trim().min(1).max(120),
    baseline: z.string().trim().min(1).max(2000),
    intervention: z.string().trim().min(1).max(2000),
    outcome: z.string().trim().min(1).max(2000),
    source: z.string().trim().min(1).max(500),
    permissionGranted: z.boolean(),
  }).strict(),
  industries: z.object({
    considerations: textList,
    related: textList,
  }).strict(),
  insights: z.object({ sections: sectionList }).strict(),
  testimonials: z.object({
    quote: z.string().trim().min(1).max(1500),
    person: z.string().trim().min(1).max(120),
    role: optionalText(140),
    company: optionalText(140),
    permissionGranted: z.boolean(),
  }).strict(),
  faqs: z.object({
    question: z.string().trim().min(1).max(300),
    answer: z.string().trim().min(1).max(3000),
    serviceSlug: optionalText(120),
  }).strict(),
}
const contentSchema = z.object({
  collection: z.enum(collections),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  title: z.string().trim().min(1).max(180),
  summary: z.string().trim().min(1).max(1000),
  status: z.enum(['draft', 'published']),
  image: z.object({
    url: optionalText(500),
    alt: optionalText(300),
  }).default({}),
  seo: z.object({
    title: optionalText(180),
    description: optionalText(500),
    canonicalUrl: optionalText(500),
  }).default({}),
  data: z.record(z.string(), z.unknown()),
}).strict()

// Validates shared and collection-specific data before it is stored or published.
function parseEntry(body, res) {
  const parsed = contentSchema.safeParse(body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Check the title, slug, summary, SEO fields and collection status.' })
    return null
  }
  const data = collectionData[parsed.data.collection].safeParse(parsed.data.data)
  if (!data.success) {
    res.status(400).json({ message: `Complete the structured fields for the ${parsed.data.collection} collection.` })
    return null
  }
  const { image, seo } = parsed.data
  if (image.url) {
    try {
      if (!['http:', 'https:'].includes(new URL(image.url).protocol)) throw new Error('Unsupported protocol')
    } catch {
      res.status(400).json({ message: 'Provide a valid HTTP(S) image URL.' })
      return null
    }
    if (!image.alt) {
      res.status(400).json({ message: 'Provide descriptive image alt text when an image is used.' })
      return null
    }
  }
  if (seo.canonicalUrl && !/^\/(?!\/)/.test(seo.canonicalUrl) && !/^https?:\/\//i.test(seo.canonicalUrl)) {
    res.status(400).json({ message: 'Canonical URL must be an absolute HTTP(S) URL or a site-relative path.' })
    return null
  }
  if (parsed.data.status === 'published' && parsed.data.collection === 'case-studies' && !data.data.permissionGranted) {
    res.status(400).json({ message: 'A case study cannot be published without documented client permission.' })
    return null
  }
  if (parsed.data.status === 'published' && parsed.data.collection === 'testimonials' && !data.data.permissionGranted) {
    res.status(400).json({ message: 'A testimonial cannot be published without documented client permission.' })
    return null
  }
  return { ...parsed.data, data: data.data }
}

// Confirms a requested collection is supported, responding with an error otherwise.
function validCollection(collection, res) {
  if (collections.includes(collection)) return true
  res.status(400).json({ message: 'Choose a supported content collection.' })
  return false
}

// Maps the stored contentType field to the public collection field.
function serializeEntry(entry) {
  const plainEntry = typeof entry.toObject === 'function' ? entry.toObject() : entry
  const { contentType, ...fields } = plainEntry
  return { ...fields, collection: contentType }
}

// Lists all entries, optionally limited to a collection, for administrators.
export async function listManagedEntries(req, res) {
  const filter = req.query.collection ? { contentType: req.query.collection } : {}
  if (req.query.collection && !validCollection(req.query.collection, res)) return
  const entries = await ContentEntry.find(filter).sort({ updatedAt: -1 }).lean()
  return res.json({ entries: entries.map(serializeEntry) })
}

// Lists published entries from a requested collection.
export async function listPublishedEntries(req, res) {
  const { collection } = req.query
  if (!validCollection(collection, res)) return
  const entries = await ContentEntry.find({ contentType: collection, status: 'published' }).sort({ updatedAt: -1 }).lean()
  return res.json({ entries: entries.map(serializeEntry) })
}

// Fetches one published entry by collection and slug.
export async function getPublishedEntry(req, res) {
  if (!validCollection(req.params.collection, res)) return
  const entry = await ContentEntry.findOne({
    contentType: req.params.collection,
    slug: req.params.slug,
    status: 'published',
  }).lean()
  if (!entry) return res.status(404).json({ message: 'Published content was not found.' })
  return res.json({ entry: serializeEntry(entry) })
}

// Creates a CMS entry for administrators.
export async function createEntry(req, res) {
  const entry = parseEntry(req.body, res)
  if (!entry) return
  const { collection, ...fields } = entry
  const created = await ContentEntry.create({ ...fields, contentType: collection, createdBy: req.admin.id, updatedBy: req.admin.id })
  return res.status(201).json({ entry: serializeEntry(created) })
}

// Updates a CMS entry for administrators.
export async function updateEntry(req, res) {
  const entry = parseEntry(req.body, res)
  if (!entry) return
  const { collection, ...fields } = entry
  const updated = await ContentEntry.findByIdAndUpdate(
    req.params.id,
    { ...fields, contentType: collection, updatedBy: req.admin.id },
    { new: true, runValidators: true },
  )
  if (!updated) return res.status(404).json({ message: 'Content entry was not found.' })
  return res.json({ entry: serializeEntry(updated) })
}

// Deletes a CMS entry for administrators.
export async function deleteEntry(req, res) {
  const deleted = await ContentEntry.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ message: 'Content entry was not found.' })
  return res.json({ message: 'Content entry removed.' })
}
