// Composes the animated homepage sections and their interactive growth tools.
import { lazy, memo, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Database,
  Link2,
  Rocket,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  UsersRound,
} from 'lucide-react'
import { ContactSection } from '../components/ContactSection'
import { ServiceCatalog } from '../components/ServiceCatalog'
import { TextReveal } from '../components/TextReveal'
import { Link, useNavigate } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

const CountryGlobe = lazy(() => import('../components/CountryGlobe'))

const wheelSectors = [
  {
    label: '01 · MARKETPLACES',
    ariaLabel: '01 — MARKETPLACES',
    to: '/solutions/marketplace-growth',
    image: '/images/marketplaces.webp',
    preview: 'Turn marketplaces into a repeatable growth channel.',
    x: 300,
    y: -123,
    clip: 'M343.91,85.24 A316,316,0,0,1,656.09,85.24 L609.66,166.97 A222,222,0,0,0,390.34,166.97Z',
    hit: 'M325,56.89 A350,350,0,0,1,675,56.89 L611,167.74 A222,222,0,0,0,389,167.74Z',
    textPath: 'M356.21,65.20 A328,328,0,0,1,643.79,65.20',
  },
  {
    label: '02 · PERFORMANCE',
    ariaLabel: '02 — PERFORMANCE',
    to: '/solutions/performance-marketing',
    image: '/images/performance.webp',
    preview: 'Make every campaign accountable to growth.',
    x: 545.085,
    y: 18.5,
    clip: 'M659.91,87.45 A316,316,0,0,1,815.99,357.79 L721.99,358.45 A222,222,0,0,0,612.34,168.52Z',
    hit: 'M675,56.89 A350,350,0,0,1,850,360 L722,360 A222,222,0,0,0,611,167.74Z',
    textPath: 'M683.42,88.08 A328,328,0,0,1,827.20,337.12',
  },
  {
    label: '03 · ECOMMERCE',
    ariaLabel: '03 — ECOMMERCE',
    to: '/solutions/ecommerce-development',
    image: '/images/ecommerce.webp',
    preview: 'Build smoother journeys from click to checkout.',
    x: 545.085,
    y: 301.5,
    clip: 'M815.99,362.21 A316,316,0,0,1,659.91,632.55 L612.34,551.48 A222,222,0,0,0,721.99,361.55Z',
    hit: 'M850,360 A350,350,0,0,1,675,663.11 L611,552.26 A222,222,0,0,0,722,360Z',
    textPath: 'M683.42,631.92 A328,328,0,0,0,827.20,382.88',
  },
  {
    label: '04 · WEBSITE & UX',
    ariaLabel: '04 — WEBSITE & UX',
    to: '/solutions/ui-ux-design',
    image: '/images/website-ux.webp',
    preview: 'Make every interaction clearer and easier.',
    x: 300,
    y: 443,
    clip: 'M656.09,634.76 A316,316,0,0,1,343.91,634.76 L390.34,553.03 A222,222,0,0,0,609.66,553.03Z',
    hit: 'M675,663.11 A350,350,0,0,1,325,663.11 L389,552.26 A222,222,0,0,0,611,552.26Z',
    textPath: 'M356.21,654.80 A328,328,0,0,0,643.79,654.80',
  },
  {
    label: '05 · BRAND',
    ariaLabel: '05 — BRAND',
    to: '/solutions/creative-content',
    image: '/images/brand.webp',
    preview: 'Create a distinctive voice customers remember.',
    x: 54.915,
    y: 301.5,
    clip: 'M340.09,632.55 A316,316,0,0,1,184.01,362.21 L278.01,361.55 A222,222,0,0,0,387.66,551.48Z',
    hit: 'M325,663.11 A350,350,0,0,1,150,360 L278,360 A222,222,0,0,0,389,552.26Z',
    textPath: 'M172.80,382.88 A328,328,0,0,0,316.58,631.92',
  },
  {
    label: '06 · GROWTH STRATEGY',
    ariaLabel: '06 — GROWTH STRATEGY',
    to: '/solutions/growth-intelligence',
    image: '/images/growth-strategy.webp',
    preview: 'Find the next move—and make it measurable.',
    x: 54.915,
    y: 18.5,
    clip: 'M184.01,357.79 A316,316,0,0,1,340.09,87.45 L387.66,168.52 A222,222,0,0,0,278.01,358.45Z',
    hit: 'M150,360 A350,350,0,0,1,325,56.89 L389,167.74 A222,222,0,0,0,278,360Z',
    textPath: 'M172.80,337.12 A328,328,0,0,1,316.58,88.08',
  },
]

const servicePillars = [
  {
    slug: 'marketplace-growth',
    title: 'Marketplace Growth',
    heading: 'From first listing to category leadership.',
    body: 'Amazon India and USA, Walmart USA, Flipkart, Myntra, AJIO, Nykaa, Meesho, Etsy and quick-commerce channels.',
    icon: ShoppingBag,
  },
  {
    slug: 'performance-marketing',
    title: 'Performance Marketing',
    heading: 'Performance built around profitable decisions.',
    body: 'Meta Ads, Google Search and Shopping, retargeting, lead generation and performance measurement.',
    icon: BarChart3,
  },
  {
    slug: 'ecommerce-development',
    title: 'E-commerce & Web',
    heading: 'A storefront designed to turn attention into action.',
    body: 'Shopify and other commerce experiences, landing pages, storefront optimisation and conversion-focused development.',
    icon: Store,
  },
  {
    slug: 'creative-content',
    title: 'Creative & Content',
    heading: 'Make every impression work harder.',
    body: 'Product listing visuals, Amazon A+ content, advertising variants, video and AI-assisted creative.',
    icon: Sparkles,
  },
  {
    slug: 'seo',
    title: 'Organic Visibility',
    heading: 'Get discovered where purchase intent begins.',
    body: 'SEO, organic growth strategy, search visibility and content optimization.',
    icon: Search,
  },
  {
    slug: 'growth-intelligence',
    title: 'Growth Intelligence',
    heading: 'Connect the data. Find the opportunity.',
    body: 'Performance reporting, business insights, growth diagnostics and decision support.',
    icon: Database,
  },
]

const problemPoints = [
  {
    title: 'Disconnected Channels',
    body: 'Marketing, marketplaces and content operate in silos instead of working towards shared goals.',
    icon: Link2,
  },
  {
    title: 'Wasted Budget',
    body: "Spend goes into activities that don't consistently support one another or compound results.",
    icon: Database,
  },
  {
    title: 'Lack of Clear Insights',
    body: "Scattered data makes it harder to understand what's working and where to act next.",
    icon: BarChart3,
  },
  {
    title: 'Inconsistent Execution',
    body: 'Different teams, different priorities and no unified direction.',
    icon: UsersRound,
  },
  {
    title: 'Missed Opportunities',
    body: 'Your product reaches only a fraction of its potential when important growth levers remain disconnected.',
    icon: Rocket,
  },
  {
    title: 'Slower Growth',
    body: 'Manual processes and reactive decisions make it harder to scale consistently.',
    icon: Clock3,
  },
]

const questions = [
  {
    prompt: 'Where do you currently sell?',
    options: ['Amazon', 'Walmart', 'Your own website', 'Multiple channels', 'Planning to expand'],
  },
  {
    prompt: 'What is your biggest growth challenge?',
    options: [
      'Generating profitable sales',
      'Improving conversions',
      'Scaling marketplace performance',
      'Building stronger creative',
      'Improving organic visibility',
      'Connecting channels and reporting',
    ],
  },
  {
    prompt: 'Which market are you targeting?',
    options: ['India', 'United States', 'United Kingdom', 'Multiple markets', 'Other'],
  },
]

const serviceByChallenge = {
  'Generating profitable sales': 1,
  'Improving conversions': 2,
  'Scaling marketplace performance': 0,
  'Building stronger creative': 3,
  'Improving organic visibility': 4,
  'Connecting channels and reporting': 5,
}

const capabilities = [
  {
    category: 'Marketplace Growth',
    title: 'A stronger foundation for marketplace growth',
    summary: 'Connect catalog quality, discoverability, storefronts and account health across the marketplaces that fit the business.',
    deliverables: ['Catalog and listing SEO', 'Storefront and promotions', 'Account health and reporting'],
    image: '/images/marketplaces.webp',
  },
  {
    category: 'Performance Marketing',
    title: 'Paid media built around better decisions',
    summary: 'Bring campaign structure, creative testing, landing pages and measurement into one optimisation process.',
    deliverables: ['Tracking and account audit', 'Campaign and test plan', 'Measurement and optimisation'],
    image: '/images/performance.webp',
  },
  {
    category: 'E-commerce & Web',
    title: 'A storefront made for the whole journey',
    summary: 'Plan and build focused shopping experiences from clear information architecture to considered conversion flows.',
    deliverables: ['Store and page architecture', 'Responsive storefront build', 'Conversion flow and analytics'],
    image: '/images/website-ux.webp',
  },
  {
    category: 'Creative & Content',
    title: 'Product creative with a clear job to do',
    summary: 'Create a consistent visual system for product discovery, marketplace listings and campaign testing.',
    deliverables: ['Listing and A+ content', 'Brand-aligned product visuals', 'Creative variants for testing'],
    image: '/images/brand.webp',
  },
]

const capabilityFilters = ['All capabilities', ...capabilities.map((capability) => capability.category)]

const industries = [
  {
    slug: 'fashion',
    name: 'Fashion & Apparel',
    body: 'Build stronger product presentation, discoverability and conversion.',
    image: '/images/brand.webp',
  },
  {
    slug: 'beauty',
    name: 'Beauty & Personal Care',
    body: 'Connect compelling creative with product education and purchase intent.',
    image: '/images/marketplaces.webp',
  },
  {
    slug: 'fmcg',
    name: 'FMCG',
    body: 'Improve catalog consistency, visibility and coordinated channel execution.',
    image: '/images/performance.webp',
  },
  {
    slug: 'home-living',
    name: 'Home & Lifestyle',
    body: 'Turn product discovery into a clearer, more effective buying experience.',
    image: '/images/website-ux.webp',
  },
]

const marketCoverage = [
  {
    name: 'India',
    code: 'IN',
    platforms: ['Amazon India', 'Flipkart', 'Myntra', 'AJIO', 'Nykaa', 'Meesho', 'Quick commerce'],
    scope: 'Marketplace operations, catalog foundations and channel priorities shaped around the category and operating requirements.',
  },
  {
    name: 'United States',
    code: 'US',
    platforms: ['Amazon USA', 'Walmart Marketplace USA', 'Etsy', 'D2C storefronts'],
    scope: 'Marketplace readiness, catalog and growth planning for the channels that fit the brand and its operating model.',
  },
  {
    name: 'United Kingdom',
    code: 'UK',
    platforms: ['Marketplace options', 'E-commerce storefronts', 'Paid media'],
    scope: 'Channel fit and expansion requirements are reviewed with the business before any market plan is recommended.',
  },
]

const creativeTypes = [
  'Product listing: Before / After',
  'Storefront: Before / After',
  'Advertising creative: Before / After',
]

const systemStatements = [
  ['You don’t need more tools.', 'You need a connected system.'],
  ['You don’t need more channels.', 'You need one coordinated plan.'],
  ['You don’t need more activity.', 'You need measurable progress.'],
]

const hexagonVertices = [
  [50, 8],
  [86, 29],
  [86, 71],
  [50, 92],
  [14, 71],
  [14, 29],
]

const hexagonEdges = hexagonVertices.map(([x1, y1], index) => {
  const [x2, y2] = hexagonVertices[(index + 1) % hexagonVertices.length]
  return `M${x1} ${y1}L${x2} ${y2}`
})

// Draws the active service's position in the six-part hexagon graphic.
function ServiceHexagon({ activeService, Icon, shouldReduceMotion }) {
  return (
    <div className="figma-service-hexagon" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <polygon points={hexagonVertices.map(([x, y]) => `${x},${y}`).join(' ')} />
        {hexagonEdges.map((edge, index) => (
          <motion.path
            d={edge}
            key={edge}
            initial={false}
            animate={{
              stroke: index === activeService ? '#5b5bcc' : 'rgba(91, 91, 204, .25)',
              strokeWidth: index === activeService ? 4 : 1.2,
            }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
          />
        ))}
      </svg>
      <motion.span
        key={activeService}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7, rotate: -18 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Icon size={25} strokeWidth={1.6} />
      </motion.span>
    </div>
  )
}

// Presents an animated numbered heading for a homepage section.
function SectionHeading({ number, title, description, id, children }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.header
      className="figma-section-heading"
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.p
        className="figma-kicker"
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
      >
        {number}
      </motion.p>
      <motion.div
        className="figma-kicker-rule"
        variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.4 } } }}
        style={{ transformOrigin: 'left' }}
      />
      <h2 id={id}>
        <TextReveal variant={{
          'problem-heading': 'flip',
          'solutions-heading': 'slide',
          'diagnostic-heading': 'pop',
          'results-heading': 'rise',
          'marketplace-heading': 'flip',
          'process-heading': 'slide',
          'work-heading': 'pop',
          'industry-heading': 'rise',
          'creative-heading': 'flip',
          'team-heading': 'slide',
        }[id] || 'rise'}>{title}</TextReveal>
      </h2>
      {description && (
        <motion.p
          className="figma-section-description"
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }}
        >
          {description}
        </motion.p>
      )}
      {children}
    </motion.header>
  )
}

// Repeats the site's operating principles in a decorative ticker.
function SystemTicker() {
  return (
    <div className="figma-problem-strip" role="region" aria-label="Growth operating principles">
      <div className="figma-problem-track">
        {[0, 1].map((copy) => (
          <div className="figma-problem-group" aria-hidden={copy === 1} key={copy}>
            {systemStatements.map(([lead, emphasis]) => (
              <div className="figma-problem-item" key={lead}>
                <p><span>{lead}</span><em>{emphasis}</em></p>
                <ArrowLeft size={18} aria-hidden="true" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Displays the interactive hero orbit and loads its motion effects.
function HeroOrbit() {
  const navigate = useNavigate()
  const [activeSector, setActiveSector] = useState(0)
  const [previewSector, setPreviewSector] = useState(null)

  useEffect(() => {
    let media
    let cancelled = false
    import('gsap').then(({ gsap }) => {
      if (cancelled) return
      media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.figma-orbit-spin', {
          rotation: 360,
          duration: 130,
          ease: 'none',
          repeat: -1,
          svgOrigin: '500 360',
        })
        gsap.to('.figma-orbit-dot', {
          opacity: 0.9,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          stagger: 0.3,
          ease: 'sine.inOut',
        })
      })
    })
    return () => {
      cancelled = true
      media?.revert()
    }
  }, [])

  // Navigates to the selected sector when it is activated from the keyboard.
  function chooseSector(event, index) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    navigate(wheelSectors[index].to)
  }

  return (
    <div
      className="figma-orbit-wrap"
      onMouseLeave={() => setPreviewSector(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPreviewSector(null)
      }}
    >
      <h1 className="figma-visually-hidden">The Sales Knob — connected growth for ambitious brands</h1>
      <svg
        className="figma-orbit"
        viewBox="0 18 1000 684"
        role="group"
        aria-label="Explore six connected growth services"
      >
        <defs>
          {wheelSectors.map((sector, index) => (
            <clipPath id={`figma-wheel-wedge-${index}`} key={sector.label}>
              <path d={sector.clip} />
            </clipPath>
          ))}
          {wheelSectors.map((sector, index) => (
            <path id={`figma-wheel-label-${index}`} d={sector.textPath} key={sector.textPath} />
          ))}
        </defs>

        <g className="figma-orbit-spin" fill="none" stroke="#5b5bcc" pointerEvents="none">
          <circle cx="500" cy="360" r="392" strokeWidth=".8" strokeDasharray="2 6" opacity=".22" />
          <circle cx="500" cy="360" r="370" strokeWidth=".6" strokeDasharray="1 9" opacity=".15" />
          {[
            [304, 21],
            [696, 21],
            [892, 360],
            [696, 699],
            [304, 699],
            [108, 360],
          ].map(([cx, cy], index) => (
            <circle
              className="figma-orbit-dot"
              cx={cx}
              cy={cy}
              r="2.2"
              fill="#5b5bcc"
              stroke="none"
              opacity=".35"
              key={index}
            />
          ))}
        </g>

        {wheelSectors.map((sector, index) => (
          <g clipPath={`url(#figma-wheel-wedge-${index})`} key={sector.label} pointerEvents="none">
            <image
              href={sector.image}
              x={sector.x}
              y={sector.y}
              width="400"
              height="400"
              preserveAspectRatio="xMidYMid slice"
              className={`figma-sector-image${activeSector === index ? ' is-active' : ''}`}
            />
          </g>
        ))}

        <Suspense fallback={(
          <image
            href="/images/figma-globe.svg"
            x="278"
            y="138"
            width="444"
            height="444"
            pointerEvents="none"
          />
        )}>
          <foreignObject className="figma-orbit-globe-object" x="0" y="18" width="1000" height="684" pointerEvents="auto">
            <CountryGlobe />
          </foreignObject>
        </Suspense>

        {wheelSectors.map((sector, index) => (
          <g key={sector.label} pointerEvents="none">
            <path d={sector.clip} fill="none" stroke="#1b1b52" strokeOpacity=".14" strokeWidth="1.2" />
            <text className={activeSector === index ? 'figma-wheel-label is-active' : 'figma-wheel-label'}>
              <textPath href={`#figma-wheel-label-${index}`} startOffset="50%" textAnchor="middle">
                {sector.label}
              </textPath>
            </text>
          </g>
        ))}

        {wheelSectors.map((sector, index) => (
          <path
            className={`figma-wheel-hit${activeSector === index ? ' is-active' : ''}`}
            d={sector.hit}
            role="link"
            aria-label={sector.ariaLabel}
            tabIndex={0}
            key={sector.label}
            onClick={() => navigate(sector.to)}
            onMouseEnter={() => {
              setActiveSector(index)
              setPreviewSector(index)
            }}
            onMouseLeave={(event) => {
              if (!event.relatedTarget?.closest?.('.figma-sector-preview')) setPreviewSector(null)
            }}
            onFocus={() => {
              setActiveSector(index)
              setPreviewSector(index)
            }}
            onKeyDown={(event) => chooseSector(event, index)}
          />
        ))}
      </svg>
      <AnimatePresence>
        {previewSector !== null && (
          <motion.div
            className={`figma-sector-preview figma-sector-preview--${['top', 'right-top', 'right-bottom', 'bottom', 'left-bottom', 'left-top'][previewSector]}`}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 5 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onMouseLeave={() => setPreviewSector(null)}
          >
            <Link
              className="figma-sector-preview-link"
              to={wheelSectors[previewSector].to}
              aria-label={`Explore ${wheelSectors[previewSector].label.split(' · ')[1]}`}
            >
              <span className="figma-sector-preview-visual">
                <img src={wheelSectors[previewSector].image} alt="" />
                <span>{String(previewSector + 1).padStart(2, '0')} <i>/ 06</i></span>
              </span>
              <span className="figma-sector-preview-copy">
                <span className="figma-sector-preview-kicker">CONNECTED GROWTH SYSTEM</span>
                <strong>{wheelSectors[previewSector].label.split(' · ')[1]}</strong>
                <span className="figma-sector-preview-caption">{wheelSectors[previewSector].preview}</span>
                <span className="figma-sector-preview-action">
                  EXPLORE SERVICE
                  <span className="figma-sector-preview-arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
                </span>
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Guides visitors through questions and presents a suggested growth focus.
function Diagnostic() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(['', '', ''])
  const [complete, setComplete] = useState(false)
  const recommendationIndex = serviceByChallenge[answers[1]] ?? 0
  const recommendation = servicePillars[recommendationIndex]

  // Records an answer for the currently displayed diagnostic question.
  function selectAnswer(value) {
    setAnswers((current) => current.map((answer, index) => index === step ? value : answer))
  }

  // Clears the diagnostic answers and returns to the first question.
  function startOver() {
    setAnswers(['', '', ''])
    setStep(0)
    setComplete(false)
  }

  return (
    <section className="figma-section figma-diagnostic" id="diagnostic">
      <div className="figma-container">
        <SectionHeading
          number="04 · FIND YOUR NEXT GROWTH MOVE"
          title={<>Your next move should not be <em>guesswork.</em></>}
          description="Every business has a different growth constraint. Answer a few focused questions to identify where you should concentrate your next effort."
          id="diagnostic-heading"
        />
        <div className="figma-diagnostic-panel" aria-labelledby="diagnostic-heading">
          <AnimatePresence mode="wait" initial={false}>
            {complete ? (
              <motion.div
                className="figma-diagnostic-result"
                key="result"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <p className="figma-kicker">RESULT</p>
                <h3>Your Next Growth Move</h3>
                <p className="figma-diagnostic-intro">
                  Based on your answers, discover the area worth investigating first and the service that may help you address it.
                </p>
                <dl>
                  <div>
                    <dt>Area to investigate first</dt>
                    <dd>{answers[1]}</dd>
                  </div>
                  <div>
                    <dt>Service that may help</dt>
                    <dd>{recommendation.title}</dd>
                    <dd>{recommendation.body}</dd>
                  </div>
                  <div>
                    <dt>Your context</dt>
                    <dd>Selling: {answers[0]} · Market: {answers[2]}</dd>
                  </div>
                </dl>
                <div className="figma-diagnostic-actions">
                  <a className="figma-text-link" href="#contact">Talk to Our Team <ArrowRight size={16} /></a>
                  <button type="button" className="figma-button figma-button-quiet" onClick={startOver}>Start over</button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="figma-diagnostic-question"
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <div className="figma-question-meta">
                  <span className="figma-kicker">QUESTION {step + 1} OF 3</span>
                  <span className="figma-step-count">0{step + 1} <span>/ 03</span></span>
                </div>
                <h3>{questions[step].prompt}</h3>
                <div className="figma-answer-list" role="radiogroup" aria-label={questions[step].prompt}>
                  {questions[step].options.map((option) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={answers[step] === option}
                      className={`figma-answer${answers[step] === option ? ' is-selected' : ''}`}
                      key={option}
                      onClick={() => selectAnswer(option)}
                    >
                      <span className="figma-radio-mark" />
                      {option}
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
                <div className="figma-diagnostic-actions">
                  <button
                    className="figma-button figma-button-quiet"
                    type="button"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={step === 0}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  {step < 2 ? (
                    <button
                      className="figma-button figma-button-dark"
                      type="button"
                      disabled={!answers[step]}
                      onClick={() => setStep((current) => current + 1)}
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      className="figma-button figma-button-dark"
                      type="button"
                      disabled={!answers[step]}
                      onClick={() => setComplete(true)}
                    >
                      Diagnose My Growth Gap <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// Draws the illustrative before/after product, storefront, or ad artwork.
const ComparisonArtwork = memo(function ComparisonArtwork({ type, improved }) {
  const isStorefront = type === 1
  const isAd = type === 2
  const background = improved ? '#e5e5fb' : '#f0f0f0'
  const accent = improved ? '#5b5bcc' : '#aaaab6'

  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="figma-comparison-art" aria-hidden="true">
      <rect width="400" height="260" rx="12" fill={background} />
      {isStorefront ? (
        <>
          <rect x="22" y="24" width="356" height="36" rx="5" fill={improved ? '#fff' : '#dddde4'} />
          <rect x="40" y="38" width="90" height="8" rx="4" fill={accent} opacity=".7" />
          <rect x="28" y="77" width="210" height="148" rx="8" fill={improved ? '#c7c7f1' : '#d6d6dc'} />
          <rect x="252" y="88" width="110" height="12" rx="6" fill={accent} opacity=".7" />
          <rect x="252" y="112" width="88" height="7" rx="4" fill={accent} opacity=".28" />
          <rect x="252" y="130" width="97" height="7" rx="4" fill={accent} opacity=".28" />
          <rect x="252" y="178" width="92" height="34" rx={improved ? '17' : '4'} fill={accent} />
        </>
      ) : isAd ? (
        <>
          <rect x="28" y="30" width="344" height="200" rx="10" fill={improved ? '#d2d2f6' : '#dddde3'} />
          <circle cx={improved ? '122' : '110'} cy="130" r={improved ? '65' : '50'} fill={improved ? '#fff' : '#bdbdc7'} />
          <rect x="210" y="86" width="125" height="13" rx="6" fill={accent} opacity=".78" />
          <rect x="210" y="112" width="92" height="8" rx="4" fill={accent} opacity=".35" />
          <rect x="210" y="132" width="106" height="8" rx="4" fill={accent} opacity=".35" />
          <rect x="210" y="164" width="95" height="32" rx={improved ? '16' : '3'} fill={accent} />
        </>
      ) : (
        <>
          <rect x="40" y="30" width="150" height="200" rx={improved ? '10' : '3'} fill={improved ? '#c7c7f1' : '#bdbdc7'} />
          <rect x="215" y="30" width="145" height="16" rx="4" fill={accent} opacity=".6" />
          <rect x="215" y="58" width="100" height="10" rx="4" fill={accent} opacity=".25" />
          <rect x="215" y="190" width="90" height="40" rx={improved ? '20' : '3'} fill={accent} opacity=".9" />
        </>
      )}
    </svg>
  )
})

// Provides a draggable before-and-after comparison for selected creative types.
function CreativeComparison({ creativeType }) {
  const [comparison, setComparison] = useState(50)

  return (
    <div className="figma-comparison-stage">
      <div className="figma-comparison-side figma-comparison-after" aria-hidden={comparison === 100}>
        <span className="figma-comparison-label">AFTER</span>
        <ComparisonArtwork type={creativeType} improved />
      </div>
      <div
        className="figma-comparison-side figma-comparison-before"
        aria-hidden={comparison === 0}
        style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}
      >
        <span className="figma-comparison-label">BEFORE</span>
        <ComparisonArtwork type={creativeType} improved={false} />
      </div>
      <div className="figma-comparison-handle" style={{ left: `${comparison}%` }} aria-hidden="true">
        <span><ArrowLeft size={13} /><ArrowRight size={13} /></span>
      </div>
      <input
        aria-label="Drag to compare before and after"
        type="range"
        min="0"
        max="100"
        value={comparison}
        onChange={(event) => setComparison(Number(event.target.value))}
      />
    </div>
  )
}

// Renders the homepage's service, market, work, industry, and contact sections.
export default function HomePage() {
  const [activeService, setActiveService] = useState(0)
  const [activeMarket, setActiveMarket] = useState(0)
  const [workFilter, setWorkFilter] = useState('All capabilities')
  const [openIndustry, setOpenIndustry] = useState(0)
  const [creativeType, setCreativeType] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const visibleCapabilities = workFilter === 'All capabilities'
    ? capabilities
    : capabilities.filter((capability) => capability.category === workFilter)
  const SelectedServiceIcon = servicePillars[activeService].icon

  return (
    <div className="figma-page">
      <section className="figma-hero" aria-label="The Sales Knob growth services">
        <HeroOrbit />
      </section>

      <section className="figma-section figma-problem" id="problem">
        <div className="figma-container">
          <SectionHeading
            number="02 · THE BROKEN SYSTEM"
            title={<>Great products don’t fail<br /><em>from lack of ambition.</em></>}
            id="problem-heading"
          />
          <p className="figma-problem-subheading">They stall when growth is fragmented.</p>
          <p className="figma-problem-description">
            Most brands juggle multiple channels, tools and teams without a clear system connecting them. The result? Gaps in execution, unclear performance insights and missed opportunities to grow.
          </p>
          <ul className="figma-problem-grid">
            {problemPoints.map((point, index) => {
              const PointIcon = point.icon
              return (
                <motion.li
                  className="figma-problem-card"
                  key={point.title}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.38, delay: shouldReduceMotion ? 0 : index * 0.04 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.012 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                >
                  <span className="figma-problem-icon"><PointIcon size={25} strokeWidth={1.8} /></span>
                  <div>
                    <span className="figma-card-index">{String(index + 1).padStart(2, '0')}</span>
                    <h3>{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                </motion.li>
              )
            })}
          </ul>
          <SystemTicker />
        </div>
      </section>

      <section className="figma-section figma-solutions" id="solutions">
        <div className="figma-container">
          <SectionHeading
            number="03 · CHOOSE YOUR BOTTLENECK"
            title={<>Whatever is slowing your growth, <em>we know where to start.</em></>}
            description="Growth rarely depends on one channel alone. Identify the area holding your business back and discover how the right combination of strategy, technology, creative and execution can move it forward."
            id="solutions-heading"
          />
          <div className="figma-solutions-layout">
            <div className="figma-service-tabs" role="tablist" aria-label="Service pillars">
              {servicePillars.map((service, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeService === index}
                  aria-controls="service-detail"
                  id={`service-tab-${index}`}
                  className={`figma-service-tab${activeService === index ? ' is-active' : ''}`}
                  key={service.title}
                  onClick={() => {
                    setActiveService(index)
                    trackEvent('service_selector', { service_name: service.title })
                  }}
                  onMouseEnter={() => setActiveService(index)}
                  onFocus={() => setActiveService(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {service.title}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                className="figma-service-detail"
                role="tabpanel"
                id="service-detail"
                aria-labelledby={`service-tab-${activeService}`}
                key={activeService}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="figma-service-detail-top">
                  <span>{String(activeService + 1).padStart(2, '0')} / 06</span>
                  <ServiceHexagon
                    activeService={activeService}
                    Icon={SelectedServiceIcon}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                </div>
                <h3>{servicePillars[activeService].heading}</h3>
                <p>{servicePillars[activeService].body}</p>
                <Link className="figma-text-link" to={`/solutions/${servicePillars[activeService].slug}`}>Explore a Service <ArrowRight size={16} /></Link>
              </motion.article>
            </AnimatePresence>
          </div>
          <div className="figma-pricing-preview" id="pricing" aria-labelledby="pricing-heading">
            <div className="figma-pricing-intro">
              <p className="figma-kicker">CLEAR STARTING ESTIMATES</p>
              <h3 id="pricing-heading">Good work starts with <em>clear expectations.</em></h3>
              <p>Browse indicative project estimates in INR. Final pricing depends on scope, complexity and requirements.</p>
            </div>
            <ServiceCatalog
              compact
              highlightCategories={[
                'Website & Web Application Development',
                'E-commerce Development',
                'UI/UX Design & Figma Prototyping',
                'Social Media & Digital Marketing',
              ]}
            />
          </div>
        </div>
      </section>

      <Diagnostic />

      <section className="figma-section figma-results" id="insights">
        <div className="figma-container">
          <SectionHeading
            number="05 · HOW WE MEASURE THE WORK"
            title={<>Trust is built through <em>transparent work.</em></>}
            description="Client results belong here only when the evidence is documented and permission is in place. Every engagement should still make its goals, actions and measurement clear."
            id="results-heading"
          />
          <div className="figma-results-grid">
            {[
              ['01', 'Start with the business', 'Agree priorities, constraints and a useful baseline before work begins.'],
              ['02', 'Connect the execution', 'Coordinate strategy, creative, channels and technology around those priorities.'],
              ['03', 'Make progress visible', 'Review the work and its measurable outcomes together; no guaranteed returns.'],
            ].map(([step, title, description]) => (
              <motion.article
                className="figma-result-card"
                key={step}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.42, delay: Number(step.slice(-1)) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={shouldReduceMotion ? undefined : { y: -5 }}
              >
                <span className="figma-result-label">HOW WE WORK</span>
                <strong>{step}</strong>
                <h3>{title}</h3>
                <p>{description}</p>
                <a href="#process">Explore the process <ArrowUpRight size={15} /></a>
              </motion.article>
            ))}
          </div>
          <a className="figma-button figma-button-outline" href="#work">Explore Our Capabilities <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="figma-section figma-marketplace-network" id="markets">
        <div className="figma-container">
          <SectionHeading
            number="06 · MARKETPLACE EXPANSION"
            title={<>One brand. Multiple markets. <em>One coordinated plan.</em></>}
            description="Explore marketplace and channel scope across India, the United States and the United Kingdom. Geography indicates markets served—not physical office locations."
            id="marketplace-heading"
          />
          <div className="figma-market-layout">
            <div className="figma-market-visual" aria-hidden="true">
              <svg viewBox="0 0 640 360">
                <path className="figma-market-route" d="M142 158 C224 78 383 84 494 141" />
                <path className="figma-market-route figma-market-route-secondary" d="M284 176 C365 117 432 120 494 141" />
                <ellipse className="figma-market-orbit" cx="320" cy="174" rx="236" ry="118" />
                <circle className="figma-market-node" cx="142" cy="158" r="13" />
                <circle className="figma-market-node" cx="284" cy="176" r="13" />
                <circle className="figma-market-node" cx="494" cy="141" r="13" />
                <text x="142" y="194">US</text>
                <text x="284" y="212">UK</text>
                <text x="494" y="177">IN</text>
              </svg>
              <div className="figma-market-visual-caption"><span /> MARKET SCOPE / DISCOVERY-LED</div>
            </div>
            <div className="figma-market-panel">
              <div className="figma-market-tabs" role="tablist" aria-label="Select a target market">
                {marketCoverage.map((market, index) => (
                  <button
                    type="button"
                    role="tab"
                    id={`market-tab-${market.code}`}
                    aria-selected={activeMarket === index}
                    aria-controls="market-detail"
                    className={activeMarket === index ? 'is-active' : ''}
                    key={market.code}
                    onClick={() => {
                      setActiveMarket(index)
                      trackEvent('market_selector', { market_name: market.name })
                    }}
                  >
                    {market.name}
                  </button>
                ))}
              </div>
              <motion.div
                className="figma-market-detail"
                id="market-detail"
                role="tabpanel"
                aria-labelledby={`market-tab-${marketCoverage[activeMarket].code}`}
                key={activeMarket}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
              >
                <span className="figma-market-code">{marketCoverage[activeMarket].code}</span>
                <h3>{marketCoverage[activeMarket].name}</h3>
                <p>{marketCoverage[activeMarket].scope}</p>
                <div className="figma-market-platforms" aria-label={`Platforms and channels for ${marketCoverage[activeMarket].name}`}>
                  {marketCoverage[activeMarket].platforms.map((platform) => <span key={platform}>{platform}</span>)}
                </div>
                <Link className="figma-text-link" to="/contact">Plan a market conversation <ArrowRight size={15} /></Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="figma-section figma-process" id="process">
        <div className="figma-container">
          <SectionHeading
            number="07 · HOW WE WORK"
            title={<>Strategy is not a deck. <em>It is a system we operate.</em></>}
            description="We connect business understanding, strategic planning, hands-on execution and continuous optimization into one coordinated growth process."
            id="process-heading"
          />
          <div className="figma-process-grid">
            {[
              ['Audit', 'Understand the business, identify bottlenecks and uncover opportunities across channels.'],
              ['Architect', 'Build a focused growth plan aligned with business priorities and available resources.'],
              ['Execute', 'Put the strategy into action across the relevant channels, creative and technology.'],
              ['Optimize', 'Review performance, learn from the data and refine the approach as the business evolves.'],
            ].map(([title, body], index) => (
              <motion.article
                className="figma-process-step"
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.34, delay: index * 0.06 }}
              >
                <span className="figma-process-number">{String(index + 1).padStart(2, '0')}</span>
                {index < 3 && <span className="figma-process-then">then</span>}
                <div className="figma-process-line" />
                <h3>{title}</h3>
                <p>{body}</p>
              </motion.article>
            ))}
          </div>
          <a className="figma-button figma-button-outline" href="#contact">See Our Process <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="figma-section figma-work" id="work">
        <div className="figma-container">
          <SectionHeading
            number="08 · SELECTED CAPABILITIES"
            title={<>The systems behind the work <em>we can build together.</em></>}
            description="Explore the connected systems behind marketplace growth, performance marketing, e-commerce and creative work."
            id="work-heading"
          />
          <div className="figma-work-filters" role="group" aria-label="Filter capabilities">
            {capabilityFilters.map((filter) => (
              <button
                className={workFilter === filter ? 'is-active' : ''}
                type="button"
                aria-pressed={workFilter === filter}
                key={filter}
                onClick={() => setWorkFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className={`figma-project-grid${visibleCapabilities.length === 1 ? ' is-filtered' : ''}`}>
            <AnimatePresence mode="popLayout">
              {visibleCapabilities.map((capability, index) => (
                <motion.article
                  className={`figma-project-card${visibleCapabilities.length === 1 || index === 0 ? ' figma-project-card--featured' : ''}`}
                  key={capability.category}
                  layout
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.28, delay: shouldReduceMotion ? 0 : (index % 4) * 0.055 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.008 }}
                >
                  <div className={`figma-project-visual figma-project-visual-${String(capabilities.indexOf(capability) + 1).padStart(2, '0')}`}>
                    <img className="figma-project-image" src={capability.image} alt="" loading="lazy" />
                    <span>CAPABILITY PREVIEW / {String(capabilities.indexOf(capability) + 1).padStart(2, '0')}</span>
                    <small>{capability.category.toUpperCase()}</small>
                  </div>
                  <div className="figma-project-content">
                    <span className="figma-kicker">{capability.category.toUpperCase()}</span>
                    <h3>{capability.title}</h3>
                    <p>{capability.summary}</p>
                    <ul className="figma-project-deliverables">
                      {capability.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
                    </ul>
                    <a href="#contact">Discuss this capability <ArrowRight size={15} /></a>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
          <p className="figma-placeholder-note">Illustrative capability previews—not client case studies or verified results. Replace these visuals with approved work when available.</p>
          <a className="figma-button figma-button-outline" href="#pricing">Explore Starting Estimates <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="figma-section figma-industries" id="industry">
        <div className="figma-container">
          <SectionHeading
            number="09 · INDUSTRY-SPECIFIC GROWTH"
            title={<>Different categories. Different playbooks. <em>Same obsession with execution.</em></>}
            description="Every industry has its own buying behaviour, competitive pressures and growth opportunities. The strategy should reflect the realities of the category."
            id="industry-heading"
          />
          <div className="figma-industry-cards">
            {industries.map((industry, index) => (
              <motion.article
                className={`figma-industry-item${openIndustry === index ? ' is-open' : ''}`}
                key={industry.name}
                layout
                transition={{ layout: { type: 'spring', stiffness: 280, damping: 30 } }}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              >
                <button
                  type="button"
                  aria-expanded={openIndustry === index}
                  aria-controls={`industry-detail-${index}`}
                  onClick={() => {
                    const nextOpenIndustry = openIndustry === index ? -1 : index
                    setOpenIndustry(nextOpenIndustry)
                    trackEvent('industry_selector', { industry_name: industry.name, expanded: nextOpenIndustry === index })
                  }}
                >
                  <span className="figma-industry-index">{String(index + 1).padStart(2, '0')} / INDUSTRY</span>
                  <span className="figma-industry-name">{industry.name}</span>
                  <span className="figma-industry-chevron"><ArrowRight size={18} /></span>
                </button>
                <div className="figma-industry-card-visual" aria-hidden="true">
                  <img src={industry.image} alt="" loading="lazy" />
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <AnimatePresence initial={false}>
                  {openIndustry === index && (
                    <motion.div
                      className="figma-industry-detail"
                      id={`industry-detail-${index}`}
                      initial={{ height: 0, opacity: 0, y: 8 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: 8 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{industry.body}</p>
                      <Link className="figma-text-link" to={`/industries/${industry.slug}`}>Explore related solutions <ArrowRight size={15} /></Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            ))}
          </div>
          <a className="figma-button figma-button-outline" href="#contact">Explore Your Industry <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="figma-section figma-creative" id="creative">
        <div className="figma-container">
          <SectionHeading
            number="10 · CREATIVE THAT CONVERTS"
            title={<>Creative is not decoration. <em>It is a conversion lever.</em></>}
            description="Product imagery, storefront design and advertising creative influence how customers understand a product and decide whether to buy. Every visual should have a clear purpose."
            id="creative-heading"
          />
          <div className="figma-creative-tabs" role="tablist" aria-label="Choose a creative example">
            {creativeTypes.map((type, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={creativeType === index}
                className={creativeType === index ? 'is-active' : ''}
                key={type}
                onClick={() => setCreativeType(index)}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="figma-comparison">
            <CreativeComparison creativeType={creativeType} />
            <p className="figma-placeholder-note">
              <strong>Placeholder visuals</strong> Replace with original or authorised client work. No results are implied.
            </p>
          </div>
          <a className="figma-button figma-button-outline" href="#contact">See the Creative Studio <ArrowRight size={16} /></a>
        </div>
      </section>

      <section className="figma-section figma-team" id="about">
        <div className="figma-container">
          <SectionHeading
            number="11 · THE PEOPLE BEHIND THE WORK"
            title={<>You deserve operators who treat your business <em>like a business.</em></>}
            description="Sustainable growth needs more than recommendations. It needs people who understand the details, take ownership of execution and work toward the same business priorities."
            id="team-heading"
          />
          <div className="figma-team-layout">
            <div className="figma-team-grid">
              {Array.from({ length: 6 }, (_, index) => (
                <figure className={index === 0 ? 'is-featured' : ''} key={index}>
                  <div className="figma-team-portrait">
                    <svg viewBox="0 0 80 100" aria-hidden="true">
                      <circle cx="40" cy="34" r="16" />
                      <path d="M8 100c0-24 14-36 32-36s32 12 32 36z" />
                    </svg>
                  </div>
                  <figcaption>Name · Role</figcaption>
                </figure>
              ))}
            </div>
            <aside className="figma-team-values">
              <p className="figma-kicker">WHAT THIS SECTION WILL SHOW</p>
              <ul>
                <li>Team portraits and roles</li>
                <li>Leadership and relevant experience</li>
                <li>How teams collaborate</li>
                <li>Verified marketplace authorizations or credentials</li>
                <li>Real working moments and client partnerships</li>
              </ul>
              <p className="figma-placeholder-note">
                Portraits are placeholders. Use authentic team photography and only verified credentials or authorised logos.
              </p>
            </aside>
          </div>
          <a className="figma-button figma-button-outline" href="#contact">Meet TSK <ArrowRight size={16} /></a>
        </div>
      </section>

      <ContactSection />
    </div>
  )
}
