// Renders the growth-enquiry form and submits validated contact requests.
import { useRef, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { getCampaignAttribution, trackEvent } from '../lib/analytics'
import { TextReveal } from './TextReveal'

const initialForm = {
  name: '',
  email: '',
  company: '',
  phone: '',
  website: '',
  challenge: '',
  market: '',
  platform: '',
  budget: '',
  consent: false,
  websiteConfirm: '',
}

const growthChallenges = [
  'Generating profitable sales',
  'Improving conversions',
  'Scaling marketplace performance',
  'Building stronger creative',
  'Improving organic visibility',
  'Connecting channels and reporting',
]

const targetMarkets = ['India', 'United States', 'United Kingdom', 'Multiple markets', 'Other']
const platforms = ['Amazon', 'Walmart Marketplace', 'Flipkart', 'Myntra / AJIO', 'Quick commerce', 'Meta Ads', 'Google Ads', 'Shopify / D2C website', 'Other / not sure']
const budgetBrackets = ['Not currently spending', 'Under ₹50,000 / month', '₹50,000–₹2,00,000 / month', '₹2,00,000–₹5,00,000 / month', '₹5,00,000+ / month', 'Prefer not to say', 'Not applicable']

// Renders the accessible contact form and its submission states.
export function ContactSection({ standalone = false }) {
  const shouldReduceMotion = useReducedMotion()
  const formStartedRef = useRef(false)
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  // Collects form input while preserving checkbox values as booleans.
  function update(event) {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  // Sends the enquiry with campaign attribution and updates the form status.
  async function submit(event) {
    event.preventDefault()
    setStatus('submitting')
    setError('')
    try {
      await api.contact({ ...form, attribution: getCampaignAttribution() })
      trackEvent('generate_lead', { form_name: 'growth_blueprint' })
      setStatus('sent')
      setForm(initialForm)
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    } finally {
      setStatus((current) => current === 'submitting' ? 'idle' : current)
    }
  }

  return (
    <motion.section
      className={`figma-section figma-contact${standalone ? ' figma-contact-standalone' : ''}`}
      id={standalone ? undefined : 'contact'}
      aria-labelledby="contact-heading"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
    >
      <div className="figma-container">
        <p className="figma-kicker figma-kicker-light">12 · YOUR NEXT GROWTH MOVE</p>
        <div className="figma-kicker-rule figma-kicker-rule-light" />
        <div className="figma-contact-heading">
          <h2 id="contact-heading">
            <TextReveal variant="slide">Your next stage of growth starts with<br /><em>one better decision.</em></TextReveal>
          </h2>
          <p>
            Tell us where your business is today, what is holding it back and where you want to go.
            We’ll start with the right conversation.
          </p>
        </div>

        <div className="figma-contact-layout">
          <aside className="figma-contact-aside">
            <p>Prefer to talk first?</p>
            <a href="mailto:hello@thesalesknob.com">Talk to Our Team</a>
          </aside>

          <div className="figma-contact-form-wrap">
            {status === 'sent' ? (
              <motion.div
                className="figma-contact-success"
                role="status"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle2 size={32} />
                <h3>Thank you. We’ll be in touch.</h3>
                <p>Your growth blueprint request has been received.</p>
                <button type="button" onClick={() => setStatus('idle')}>Send another message</button>
              </motion.div>
            ) : (
              <form
                className="figma-contact-form"
                onSubmit={submit}
                onFocusCapture={() => {
                  if (formStartedRef.current) return
                  formStartedRef.current = true
                  trackEvent('form_start', { form_name: 'growth_blueprint' })
                }}
              >
                <div className="figma-form-grid">
                  <label>
                    <span>Name</span>
                    <input
                      autoComplete="name"
                      name="name"
                      value={form.name}
                      onChange={update}
                      placeholder="Your name"
                      required
                      maxLength={100}
                    />
                  </label>
                  <label>
                    <span>Work email</span>
                    <input
                      autoComplete="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={update}
                      placeholder="you@company.com"
                      required
                      maxLength={254}
                    />
                  </label>
                  <label>
                    <span>Company / brand</span>
                    <input
                      autoComplete="organization"
                      name="company"
                      value={form.company}
                      onChange={update}
                      placeholder="Company or brand"
                      maxLength={140}
                    />
                  </label>
                  <label>
                    <span>Phone / WhatsApp (optional)</span>
                    <input
                      autoComplete="tel"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={update}
                      placeholder="Include country code"
                      maxLength={40}
                    />
                  </label>
                  <label>
                    <span>Website or marketplace link</span>
                    <input
                      autoComplete="url"
                      name="website"
                      type="url"
                      value={form.website}
                      onChange={update}
                      placeholder="https://"
                      maxLength={300}
                    />
                  </label>
                  <label>
                    <span>Primary growth challenge</span>
                    <select name="challenge" value={form.challenge} onChange={update} required>
                      <option value="">Select one</option>
                      {growthChallenges.map((challenge) => <option key={challenge}>{challenge}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Target market</span>
                    <select name="market" value={form.market} onChange={update} required>
                      <option value="">Select one</option>
                      {targetMarkets.map((market) => <option key={market}>{market}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Platform / channel</span>
                    <select name="platform" value={form.platform} onChange={update} required>
                      <option value="">Select one</option>
                      {platforms.map((platform) => <option key={platform}>{platform}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Monthly ad budget (optional)</span>
                    <select name="budget" value={form.budget} onChange={update}>
                      <option value="">Select a range</option>
                      {budgetBrackets.map((budget) => <option key={budget}>{budget}</option>)}
                    </select>
                  </label>
                  <label className="figma-honeypot" aria-hidden="true" tabIndex="-1">
                    Website confirmation
                    <input
                      name="websiteConfirm"
                      value={form.websiteConfirm}
                      onChange={update}
                      tabIndex="-1"
                      autoComplete="off"
                    />
                  </label>
                </div>
                {error && <p className="figma-form-error" role="alert">{error}</p>}
                <div className="figma-form-submit-row">
                  <button className="figma-button figma-button-light" type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending…' : 'Get My Growth Blueprint'}
                    <ArrowRight size={17} />
                  </button>
                  <label className="figma-consent">
                    <input name="consent" type="checkbox" checked={form.consent} onChange={update} required />
                    <span>I agree to be contacted about this enquiry. See our <Link to="/privacy">privacy notice</Link>.</span>
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
