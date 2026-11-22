// Exercises CMS access, structured content validation, and editor permissions.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import bcrypt from 'bcryptjs'
import { Admin } from '../src/models/Admin.js'
import { ContentEntry } from '../src/models/ContentEntry.js'

process.env.JWT_SECRET = 'test-only-secret-with-at-least-thirty-two-characters'
const { default: app } = await import('../src/app.js')

// Verifies editor CMS access while ensuring pricing and enquiry data remain restricted.
test('editors can manage structured CMS content but cannot access pricing or private enquiries', async () => {
  const original = {
    findOne: Admin.findOne,
    find: ContentEntry.find,
    findOneContent: ContentEntry.findOne,
    create: ContentEntry.create,
    update: ContentEntry.findByIdAndUpdate,
    remove: ContentEntry.findByIdAndDelete,
  }
  const editor = {
    id: 'editor-test-id',
    email: 'editor@example.test',
    role: 'editor',
    passwordHash: await bcrypt.hash('correct-horse-battery-staple', 4),
  }
  const records = []
  Admin.findOne = () => ({ select: async () => editor })
  ContentEntry.find = (filter) => ({
    sort() {
      return this
    },
    lean: async () => records.filter((entry) => Object.entries(filter).every(([key, value]) => entry[key] === value)),
  })
  ContentEntry.findOne = (filter) => ({
    lean: async () => records.find((entry) =>
      Object.entries(filter).every(([key, value]) => entry[key] === value)) || null,
  })
  ContentEntry.create = async (data) => {
    const entry = { ...data, _id: `content-${records.length + 1}` }
    records.push(entry)
    return entry
  }
  ContentEntry.findByIdAndUpdate = async (id, data) => {
    const entry = records.find((item) => item._id === id)
    if (!entry) return null
    Object.assign(entry, data)
    return entry
  }
  ContentEntry.findByIdAndDelete = async (id) => {
    const index = records.findIndex((entry) => entry._id === id)
    return index < 0 ? null : records.splice(index, 1)[0]
  }

  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editor.email, password: 'correct-horse-battery-staple' }),
    })
    assert.equal(login.status, 200)
    assert.equal((await login.json()).admin.role, 'editor')
    const cookie = login.headers.get('set-cookie').split(';', 1)[0]
    const content = {
      collection: 'insights',
      slug: 'marketplace-readiness',
      title: 'Marketplace readiness',
      summary: 'A practical readiness check.',
      status: 'published',
      image: { url: '', alt: '' },
      seo: { title: 'Marketplace readiness', description: 'A useful checklist.', canonicalUrl: '/insights/marketplace-readiness' },
      data: { sections: [{ heading: 'Start with the offer', body: 'Review the product and customer fit.' }] },
    }

    const created = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(content),
    })
    assert.equal(created.status, 201)
    assert.equal((await created.json()).entry.status, 'published')

    const updated = await fetch(`${baseUrl}/api/content/content-1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ ...content, summary: 'Updated and approved summary.' }),
    })
    assert.equal(updated.status, 200)
    assert.equal((await updated.json()).entry.summary, 'Updated and approved summary.')

    const publicContent = await fetch(`${baseUrl}/api/content?collection=insights`)
    assert.equal(publicContent.status, 200)
    assert.equal((await publicContent.json()).entries.length, 1)
    const detail = await fetch(`${baseUrl}/api/content/insights/marketplace-readiness`)
    assert.equal(detail.status, 200)
    assert.equal((await detail.json()).entry.seo.canonicalUrl, '/insights/marketplace-readiness')

    const invalidCaseStudy = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        ...content,
        collection: 'case-studies',
        slug: 'unapproved-case',
        data: {
          clientLabel: '',
          industry: 'Retail',
          baseline: 'Baseline period',
          intervention: 'Work completed',
          outcome: 'Observed outcome',
          source: 'Internal report',
          permissionGranted: false,
        },
      }),
    })
    assert.equal(invalidCaseStudy.status, 400)

    const missingAlt = await fetch(`${baseUrl}/api/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({
        ...content,
        slug: 'image-without-alt',
        image: { url: 'https://example.test/cover.jpg', alt: '' },
      }),
    })
    assert.equal(missingAlt.status, 400)

    const pricingDenied = await fetch(`${baseUrl}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ category: 'Web', name: 'Site', priceLabel: '₹1,000' }),
    })
    assert.equal(pricingDenied.status, 403)

    const inboxDenied = await fetch(`${baseUrl}/api/contact`, { headers: { Cookie: cookie } })
    assert.equal(inboxDenied.status, 403)

    const { collection, ...draftFields } = { ...content, slug: 'private-draft', status: 'draft' }
    const draft = { ...draftFields, contentType: collection }
    await ContentEntry.create(draft)
    const publicEntries = await fetch(`${baseUrl}/api/content?collection=insights`)
    assert.equal((await publicEntries.json()).entries.length, 1)

    const removed = await fetch(`${baseUrl}/api/content/content-1`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    })
    assert.equal(removed.status, 200)
    const afterRemoval = await fetch(`${baseUrl}/api/content?collection=insights`)
    assert.equal((await afterRemoval.json()).entries.length, 0)
  } finally {
    server.closeAllConnections()
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    Admin.findOne = original.findOne
    ContentEntry.find = original.find
    ContentEntry.findOne = original.findOneContent
    ContentEntry.create = original.create
    ContentEntry.findByIdAndUpdate = original.update
    ContentEntry.findByIdAndDelete = original.remove
  }
})
