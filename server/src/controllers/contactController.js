// Handles public enquiries and the administrator enquiry inbox.
import { z } from 'zod'
import { Contact } from '../models/Contact.js'

// Treats empty optional text values as omitted before applying string validation.
const optionalText = (limit) => z.preprocess(
  (value) => value === '' ? undefined : value,
  z.string().trim().max(limit).optional(),
)
const attributionSchema = z.object({
  source: optionalText(100),
  medium: optionalText(100),
  campaign: optionalText(100),
  content: optionalText(100),
  term: optionalText(100),
  landingPage: optionalText(500),
  referrer: optionalText(500),
}).optional()
const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  company: optionalText(140),
  phone: optionalText(40),
  website: z.preprocess(
    (value) => value === '' ? undefined : value,
    z.string().url().max(300).optional(),
  ),
  market: optionalText(80),
  platform: optionalText(100),
  challenge: z.string().trim().min(1).max(3000),
  budget: optionalText(80),
  attribution: attributionSchema,
  consent: z.literal(true),
  websiteConfirm: z.string().max(300).optional(),
})

// Validates and stores a contact enquiry while rejecting honeypot submissions.
export async function createContact(req, res) {
  const parsed = contactSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: 'Check the required fields, email address, and consent, then try again.' })
  }
  if (parsed.data.websiteConfirm) {
    return res.status(400).json({ message: 'The enquiry could not be accepted. Please try again.' })
  }

  const { websiteConfirm, ...submission } = parsed.data
  const contact = await Contact.create(submission)
  return res.status(201).json({ id: contact.id, message: 'Your enquiry has been received.' })
}

// Returns the latest enquiries to authorized administrators.
export async function listContacts(_req, res) {
  const submissions = await Contact.find().sort({ createdAt: -1 }).limit(100).lean()
  return res.json({ submissions })
}

// Marks an enquiry as reviewed for authorized administrators.
export async function markContactReviewed(req, res) {
  const submission = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: 'reviewed' },
    { new: true, runValidators: true },
  )
  if (!submission) return res.status(404).json({ message: 'Enquiry not found.' })
  return res.json({ submission })
}
