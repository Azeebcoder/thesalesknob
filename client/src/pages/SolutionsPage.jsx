// Presents the solution directory and details for individual capabilities.
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link, Navigate, useParams } from 'react-router-dom'
import { solutionPages } from '../data/growthPages'
import { usePublishedContent } from '../lib/usePublishedContent'
import { TextReveal } from '../components/TextReveal'

// Merges static solution details with published CMS entries.
function useSolutions() {
  const { entries, loading } = usePublishedContent('services')
  const solutions = new Map(solutionPages.map((solution) => [solution.slug, solution]))
  entries.forEach((entry) => {
    const data = entry.data
    solutions.set(entry.slug, {
      ...solutions.get(entry.slug),
      slug: entry.slug,
      category: data.category,
      headline: entry.title,
      description: entry.summary,
      audience: data.audience,
      challenges: data.challenges,
      deliverables: data.deliverables,
      channels: data.channels,
      cta: data.cta,
    })
  })
  return { solutions: [...solutions.values()], loading }
}

// Renders a reusable animated route heading with optional supporting content.
function PageIntro({ eyebrow, title, description, children }) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.section
      className="route-hero"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
    >
      <div className="figma-container">
        <p className="figma-kicker">{eyebrow}</p>
        <h1><TextReveal variant="flip">{title}</TextReveal></h1>
        <p className="route-hero-copy">{description}</p>
        {children}
      </div>
    </motion.section>
  )
}

// Lists featured growth pillars and specialist solution pages.
export function SolutionsIndexPage() {
  const { solutions } = useSolutions()
  const pillars = solutions.slice(0, 6)
  const detailPages = solutions.slice(6)

  return (
    <div className="figma-page content-route">
      <PageIntro
        eyebrow="CONNECTED CAPABILITIES"
        title={<>One growth plan.<br /><em>Joined-up execution.</em></>}
        description="Explore the capabilities behind a connected operating plan. Start with the problem, then agree on a scope that fits your business."
      >
        <Link className="figma-button figma-button-dark" to="/contact">Talk through a priority <ArrowRight size={16} /></Link>
      </PageIntro>
      <section className="route-section">
        <div className="figma-container">
          <div className="route-section-heading">
            <p className="figma-kicker">SIX CONNECTED PILLARS</p>
            <h2><TextReveal variant="slide">Choose where<br /><em>to begin.</em></TextReveal></h2>
          </div>
          <div className="route-card-grid">
            {pillars.map((service, index) => (
              <Link className="route-card" to={`/solutions/${service.slug}`} key={service.slug}>
                <span className="route-card-index">{String(index + 1).padStart(2, '0')} / SOLUTION</span>
                <h3>{service.category}</h3>
                <p>{service.description}</p>
                <span className="route-card-link">Explore capability <ArrowUpRight size={15} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="route-section route-section-soft">
        <div className="figma-container">
          <div className="route-section-heading">
            <p className="figma-kicker">SPECIALIST SERVICES</p>
            <h2><TextReveal variant="pop">Find the right<br /><em>starting point.</em></TextReveal></h2>
          </div>
          <div className="route-link-list">
            {detailPages.map((service) => (
              <Link to={`/solutions/${service.slug}`} key={service.slug}>
                <span><small>{service.category}</small>{service.slug === 'amazon-management' ? 'Amazon marketplace service' : service.headline}</span>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
          <Link className="figma-text-link" to="/services">Browse all indicative service estimates <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  )
}

// Renders a selected solution's audience, challenges, deliverables, and FAQs.
export default function SolutionDetailPage() {
  const { slug } = useParams()
  const { solutions, loading } = useSolutions()
  const solution = solutions.find((item) => item.slug === slug)
  const { entries: publishedFaqs } = usePublishedContent('faqs')
  const shouldReduceMotion = useReducedMotion()

  if (!solution && loading) return <div className="page-loader" role="status">Loading solution…</div>
  if (!solution) return <Navigate to="/404" replace />
  const serviceFaqs = publishedFaqs
    .filter(({ data }) => !data.serviceSlug || data.serviceSlug === slug)
    .map(({ data }) => ({ question: data.question, answer: data.answer }))
  const faqs = serviceFaqs.length ? serviceFaqs : solution.faqs || []

  return (
    <div className="figma-page content-route">
      <PageIntro
        eyebrow={`SOLUTION / ${solution.category.toUpperCase()}`}
        title={solution.headline}
        description={solution.description}
      >
        <div className="route-hero-actions">
          <Link className="figma-button figma-button-dark" to="/contact">
            {solution.cta || `Discuss ${solution.category}`} <ArrowRight size={16} />
          </Link>
          <Link className="figma-button figma-button-outline" to="/services">View estimates</Link>
        </div>
      </PageIntro>
      <motion.section
        className="route-section"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      >
        <div className="figma-container route-detail-grid">
          <div className="route-detail-intro">
            <p className="figma-kicker">WHO THIS IS FOR</p>
            <h2><TextReveal variant="rise">Start with the<br /><em>business context.</em></TextReveal></h2>
            <p>{solution.audience}</p>
            <div className="route-channel-list">
              {solution.channels.map((channel) => <span key={channel}>{channel}</span>)}
            </div>
          </div>
          <div className="route-challenges">
            <p className="figma-kicker">COMMON FAILURE POINTS</p>
            {solution.challenges.map((challenge, index) => (
              <div className="route-challenge" key={challenge}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{challenge}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      <section className="route-section route-section-soft">
        <div className="figma-container route-detail-grid">
          <div className="route-detail-intro">
            <p className="figma-kicker">PRACTICAL DELIVERABLES</p>
            <h2><TextReveal variant="slide">Make the work<br /><em>clear and useful.</em></TextReveal></h2>
            <p>Final deliverables are agreed after discovery and written into the project scope.</p>
          </div>
          <ul className="route-deliverables">
            {solution.deliverables.map((item) => (
              <li key={item}><Check size={17} /><span>{item}</span></li>
            ))}
          </ul>
        </div>
      </section>
      <section className="route-section route-method-section">
        <div className="figma-container route-method-content">
          <div>
            <p className="figma-kicker figma-kicker-light">THE TSK METHOD</p>
            <h2><TextReveal variant="flip">Audit → Architect<br />→ Execute → Optimize</TextReveal></h2>
          </div>
          <p>We begin by understanding your offer, channels and constraints. Together we set priorities, agree on the work and review what the evidence says next. No guaranteed ROI or unverified performance claims.</p>
        </div>
      </section>
      <section className="route-section route-section-soft">
        <div className="figma-container route-detail-grid">
          <div className="route-detail-intro">
            <p className="figma-kicker">EVIDENCE BEFORE CLAIMS</p>
            <h2><TextReveal variant="pop">Show the work.<br /><em>Keep the context.</em></TextReveal></h2>
            <p>We do not publish client outcomes without a documented source and permission.</p>
          </div>
          <ul className="route-evidence-list">
            <li><span>01</span><div><strong>Baseline</strong><p>Agree the starting point, timeframe and data source.</p></div></li>
            <li><span>02</span><div><strong>Intervention</strong><p>Record the work completed and the decisions it informed.</p></div></li>
            <li><span>03</span><div><strong>Outcome</strong><p>Review observed outcomes with relevant constraints and context.</p></div></li>
            <li><span>04</span><div><strong>Permission</strong><p>Use client-identifying details only with written approval.</p></div></li>
          </ul>
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="route-section">
          <div className="figma-container route-faq-layout">
            <div>
              <p className="figma-kicker">BEFORE WE BEGIN</p>
              <h2><TextReveal variant="rise">Clear answers.<br /><em>Thoughtful scope.</em></TextReveal></h2>
            </div>
            <div className="route-faq-list">
              {faqs.map(({ question, answer }) => (
                <details key={question}>
                  <summary>{question}<span aria-hidden="true">+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="route-cta">
        <div className="figma-container">
          <p className="figma-kicker figma-kicker-light">NEXT STEP</p>
          <h2><TextReveal variant="slide">Tell us what needs<br /><em>to work better.</em></TextReveal></h2>
          <Link className="figma-button figma-button-light" to="/contact">Request a scoped conversation <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
