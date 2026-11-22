// Exercises administrator pricing updates and the contact enquiry workflow.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import bcrypt from 'bcryptjs'
import { Admin } from '../src/models/Admin.js'
import { Contact } from '../src/models/Contact.js'
import { Service } from '../src/models/Service.js'

process.env.JWT_SECRET = 'test-only-secret-with-at-least-thirty-two-characters'
const { default: app } = await import('../src/app.js')

// Verifies price management, public catalog visibility, and enquiry review access.
test('authenticated admin price updates are reflected in the public service catalog', async () => {
  const original = {
    findOne: Admin.findOne,
    find: Service.find,
    create: Service.create,
    findByIdAndUpdate: Service.findByIdAndUpdate,
    findByIdAndDelete: Service.findByIdAndDelete,
    contactCreate: Contact.create,
    contactFind: Contact.find,
    contactUpdate: Contact.findByIdAndUpdate,
  }
  const admin = {
    id: 'admin-test-id',
    email: 'owner@example.test',
    passwordHash: await bcrypt.hash('correct-horse-battery-staple', 4),
  }
  const records = []
  const submissions = []

  Admin.findOne = () => ({ select: async () => admin })
  Service.find = () => ({
    sort() {
      return this
    },
    lean: async () => records,
  })
  Service.create = async (data) => {
    const service = { ...data, _id: 'service-test-id' }
    records.push(service)
    return service
  }
  Service.findByIdAndUpdate = async (id, data) => {
    const index = records.findIndex((service) => service._id === id)
    if (index < 0) return null
    records[index] = { ...records[index], ...data }
    return records[index]
  }
  Service.findByIdAndDelete = async (id) => {
    const index = records.findIndex((service) => service._id === id)
    if (index < 0) return null
    return records.splice(index, 1)[0]
  }
  Contact.create = async (data) => {
    const contact = { ...data, _id: 'contact-test-id', createdAt: '2026-11-20T12:00:00.000Z' }
    submissions.push(contact)
    return { id: contact._id }
  }
  Contact.find = () => ({
    sort() {
      return this
    },
    limit() {
      return this
    },
    lean: async () => submissions,
  })
  Contact.findByIdAndUpdate = async (id, data) => {
    const submission = submissions.find((item) => item._id === id)
    if (!submission) return null
    Object.assign(submission, data)
    return submission
  }

  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try {
    const anonymousSession = await fetch(`${baseUrl}/api/auth/me`)
    assert.equal(anonymousSession.status, 200)
    assert.equal((await anonymousSession.json()).admin, null)

    const denied = await fetch(`${baseUrl}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'Web', name: 'Site', priceLabel: '₹1,000' }),
    })
    assert.equal(denied.status, 401)

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'correct-horse-battery-staple' }),
    })
    assert.equal(login.status, 200)
    const cookie = login.headers.get('set-cookie').split(';', 1)[0]

    const created = await fetch(`${baseUrl}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ category: 'Web', name: 'Site', priceLabel: '₹1,000 – ₹2,000' }),
    })
    assert.equal(created.status, 201)

    const updated = await fetch(`${baseUrl}/api/services/service-test-id`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ category: 'Web', name: 'Site', priceLabel: '₹2,000 – ₹4,000' }),
    })
    assert.equal(updated.status, 200)

    const catalog = await fetch(`${baseUrl}/api/services`)
    const { services } = await catalog.json()
    assert.equal(services[0].priceLabel, '₹2,000 – ₹4,000')

    const removed = await fetch(`${baseUrl}/api/services/service-test-id`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    })
    assert.equal(removed.status, 200)
    assert.deepEqual(records, [])

    const invalidContact = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'not-an-email', challenge: 'Help', consent: false }),
    })
    assert.equal(invalidContact.status, 400)

    const contact = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Client',
        email: 'client@example.test',
        company: 'Acme Brand',
        phone: '+1 555 0100',
        market: 'United States',
        platform: 'Amazon',
        challenge: 'Improve marketplace visibility.',
        budget: 'Under ₹50,000 / month',
        attribution: {
          source: 'newsletter',
          medium: 'email',
          campaign: 'growth-planning',
          landingPage: '/contact',
        },
        consent: true,
        websiteConfirm: '',
      }),
    })
    assert.equal(contact.status, 201)

    const inboxDenied = await fetch(`${baseUrl}/api/contact`)
    assert.equal(inboxDenied.status, 401)

    const inbox = await fetch(`${baseUrl}/api/contact`, { headers: { Cookie: cookie } })
    assert.equal(inbox.status, 200)
    assert.equal((await inbox.json()).submissions.length, 1)
    assert.equal(submissions[0].company, 'Acme Brand')
    assert.equal(submissions[0].phone, '+1 555 0100')
    assert.equal(submissions[0].platform, 'Amazon')
    assert.equal(submissions[0].attribution.campaign, 'growth-planning')

    const reviewed = await fetch(`${baseUrl}/api/contact/contact-test-id/reviewed`, {
      method: 'PATCH',
      headers: { Cookie: cookie },
    })
    assert.equal(reviewed.status, 200)
    assert.equal(submissions[0].status, 'reviewed')
  } finally {
    server.closeAllConnections()
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    Admin.findOne = original.findOne
    Service.find = original.find
    Service.create = original.create
    Service.findByIdAndUpdate = original.findByIdAndUpdate
    Service.findByIdAndDelete = original.findByIdAndDelete
    Contact.create = original.contactCreate
    Contact.find = original.contactFind
    Contact.findByIdAndUpdate = original.contactUpdate
  }
})
