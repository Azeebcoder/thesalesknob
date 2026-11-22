// Provides shared navigation, footer, analytics consent, and page-level controls.
import { useEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Menu, X } from 'lucide-react'
import { getAnalyticsConsent, getCampaignAttribution, initializeAnalytics, setAnalyticsConsent, trackEvent } from '../lib/analytics'

const copyrightYear = new Date().getFullYear()

const featuredSolutions = [
  ['Marketplace Growth', '/solutions/marketplace-growth'],
  ['Performance Marketing', '/solutions/performance-marketing'],
  ['E-commerce & Web', '/solutions/ecommerce-development'],
  ['Creative & Content', '/solutions/creative-content'],
  ['Organic Visibility', '/solutions/seo'],
  ['Growth Intelligence', '/solutions/growth-intelligence'],
]

// Renders the shared site shell and coordinates navigation and consent behavior.
export function SiteLayout() {
  const { pathname, hash } = useLocation()
  const isHome = pathname === '/'
  const shouldReduceMotion = useReducedMotion()
  const mobileMenuToggleRef = useRef(null)
  const solutionsMenuButtonRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [solutionsMenuOpen, setSolutionsMenuOpen] = useState(false)
  const [analyticsConsent, setAnalyticsConsentState] = useState(getAnalyticsConsent)
  const [consentBannerOpen, setConsentBannerOpen] = useState(
    () => Boolean(import.meta.env.VITE_GTM_ID) && getAnalyticsConsent() === null,
  )
  const [hasScrolled, setHasScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > 80,
  )
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const headerVisible = !isHome || hasScrolled

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname, hash, shouldReduceMotion])

  useEffect(() => {
    // Closes open menus on Escape and returns focus to their trigger buttons.
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) mobileMenuToggleRef.current?.focus()
        if (solutionsMenuOpen) solutionsMenuButtonRef.current?.focus()
        setMobileMenuOpen(false)
        setSolutionsMenuOpen(false)
      }
    }
    // Reflects analytics consent changes dispatched elsewhere in the site.
    const handleConsentChange = (event) => setAnalyticsConsentState(event.detail)
    // Opens the consent prompt in response to a privacy-settings request.
    const handleManageConsent = () => setConsentBannerOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('tsk:consent-change', handleConsentChange)
    window.addEventListener('tsk:manage-consent', handleManageConsent)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('tsk:consent-change', handleConsentChange)
      window.removeEventListener('tsk:manage-consent', handleManageConsent)
    }
  }, [mobileMenuOpen, solutionsMenuOpen])

  useEffect(() => {
    initializeAnalytics(import.meta.env.VITE_GTM_ID)
  }, [analyticsConsent])

  useEffect(() => {
    getCampaignAttribution()
  }, [])

  useEffect(() => {
    let frame = 0
    // Throttles scroll-derived header, progress, and back-to-top state updates.
    const updatePageScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const scrollY = window.scrollY
        const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight
        if (isHome) setHasScrolled(scrollY > 80)
        setScrollProgress(scrollableDistance > 0
          ? Math.min(100, Math.round(scrollY / scrollableDistance * 100))
          : 0)
        setShowBackToTop(scrollY > 240)
      })
    }

    window.addEventListener('scroll', updatePageScroll, { passive: true })
    window.addEventListener('resize', updatePageScroll)
    updatePageScroll()
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updatePageScroll)
      window.removeEventListener('resize', updatePageScroll)
    }
  }, [isHome])

  // Tracks supported interactions with links and buttons in the page shell.
  function trackPageInteraction(event) {
    const target = event.target instanceof Element ? event.target.closest('a, button') : null
    if (!target) return

    const destination = target.href || ''
    const label = (target.getAttribute('aria-label') || target.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100)
    if (/^(https:\/\/wa\.me\/|https:\/\/api\.whatsapp\.com\/)/.test(destination)) {
      trackEvent('whatsapp_click', { link_text: label, link_url: destination })
    } else if (/(calendly\.com|cal\.com|meet\.google\.com)/i.test(destination)) {
      trackEvent('book_meeting_click', { link_text: label, link_url: destination })
    } else if (destination.startsWith('mailto:')) {
      trackEvent('email_contact_click', { link_text: label })
    } else if (target.matches('.figma-button, .button, .route-card')) {
      trackEvent('cta_click', { link_text: label, link_url: destination })
    }
  }

  // Saves the visitor's analytics choice and closes the consent prompt.
  function chooseAnalyticsConsent(consent) {
    setAnalyticsConsent(consent)
    setConsentBannerOpen(false)
  }

  return (
    <>
      <header
        className={`figma-header${isHome ? ' figma-header-floating' : ''}${headerVisible ? ' is-visible' : ''}`}
        aria-hidden={!headerVisible}
        onClick={trackPageInteraction}
      >
        <div className="figma-header-inner">
          <Link className="figma-logo" to="/" aria-label="The Sales Knob home">
            <img src="/images/tsk-logo.webp" alt="" width="72" height="72" fetchPriority="high" decoding="async" />
          </Link>
          <nav className="figma-nav" aria-label="Main navigation">
            <div
              className="figma-nav-dropdown"
              onMouseEnter={() => setSolutionsMenuOpen(true)}
              onMouseLeave={() => setSolutionsMenuOpen(false)}
              onFocus={() => setSolutionsMenuOpen(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setSolutionsMenuOpen(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setSolutionsMenuOpen(false)
              }}
            >
              <button
                ref={solutionsMenuButtonRef}
                className="figma-nav-menu-button"
                type="button"
                aria-haspopup="true"
                aria-expanded={solutionsMenuOpen}
                onClick={() => setSolutionsMenuOpen((open) => !open)}
              >
                Solutions <ArrowDown size={12} />
              </button>
              {solutionsMenuOpen && (
                <div className="figma-nav-mega" role="menu" aria-label="Solutions">
                  <div>
                    <span className="figma-nav-mega-kicker">CONNECTED CAPABILITIES</span>
                    <Link role="menuitem" to="/solutions" onClick={() => setSolutionsMenuOpen(false)}>Explore all solutions <ArrowUpRight size={14} /></Link>
                    <Link role="menuitem" to="/services" onClick={() => setSolutionsMenuOpen(false)}>Service estimates <ArrowUpRight size={14} /></Link>
                  </div>
                  <div className="figma-nav-mega-links">
                    {featuredSolutions.map(([label, to]) => (
                      <Link role="menuitem" key={to} to={to} onClick={() => setSolutionsMenuOpen(false)}>{label}<ArrowUpRight size={13} /></Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link to="/industries" onClick={() => setSolutionsMenuOpen(false)}>Industries</Link>
            <Link to="/work" onClick={() => setSolutionsMenuOpen(false)}>Our Work</Link>
            <Link to="/about" onClick={() => setSolutionsMenuOpen(false)}>About</Link>
            <Link to="/insights" onClick={() => setSolutionsMenuOpen(false)}>Insights</Link>
            <Link to="/contact" onClick={() => setSolutionsMenuOpen(false)}>Contact</Link>
          </nav>
          <button
            ref={mobileMenuToggleRef}
            className="figma-mobile-menu-toggle"
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link className="figma-button figma-button-dark figma-nav-cta" to="/contact">
            Get My Growth Blueprint <ArrowRight size={15} />
          </Link>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              id="mobile-primary-navigation"
              className="figma-mobile-nav"
              aria-label="Mobile navigation"
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18 }}
            >
              {[
                ['Solutions', '/solutions'],
                ...featuredSolutions.slice(0, 3).map(([label, to]) => [label, to]),
                ['Industries', '/industries'],
                ['Our Work', '/work'],
                ['About', '/about'],
                ['Insights', '/insights'],
                ['Service estimates', '/services'],
                ['Contact', '/contact'],
              ].map(([label, to]) => (
                <Link key={to} to={to} onClick={() => setMobileMenuOpen(false)}>
                  {label}<ArrowUpRight size={14} />
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <main onClick={trackPageInteraction}>
        <Outlet />
      </main>
      <motion.footer
        className="site-footer"
        onClick={trackPageInteraction}
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <div className="container footer-shell">
          <motion.div
            className="footer-head"
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <div className="footer-head-copy">
              <span className="footer-kicker">THE SALES KNOB · CONNECTED GROWTH</span>
              <h2>Make your next move <em>count.</em></h2>
            </div>
            <Link className="footer-contact-link" to="/contact">
              <span>Start a conversation</span>
              <span className="footer-contact-icon"><ArrowUpRight size={19} /></span>
            </Link>
          </motion.div>
          <motion.div
            className="footer-main"
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } } }}
          >
            <div className="footer-brand-block">
              <Link className="brand footer-brand" to="/" aria-label="The Sales Knob home">
                <img src="/images/tsk-logo.webp" alt="" width="58" height="58" loading="lazy" decoding="async" />
                <span className="brand-name">THE SALES KNOB</span>
              </Link>
              <p>We connect the moving parts behind ambitious brands.</p>
            </div>
            <nav className="footer-navigation" aria-label="Footer">
              <div className="footer-link-group">
                <h3>Explore</h3>
                <Link to="/solutions">Growth solutions</Link>
                <Link to="/industries">Industries</Link>
                <Link to="/work">Our work</Link>
                <Link to="/insights">Insights</Link>
              </div>
              <div className="footer-link-group">
                <h3>Build with us</h3>
                <Link to="/services">Services & estimates</Link>
                <Link to="/about">About the approach</Link>
                <Link to="/contact">Growth blueprint <ArrowUpRight size={13} /></Link>
                <Link to="/admin" className="admin-link">Admin</Link>
              </div>
              <div className="footer-link-group footer-contact-group">
                <h3>Say hello</h3>
                <a href="mailto:hello@thesalesknob.com">hello@thesalesknob.com</a>
                <span>Thoughtful strategy. Hands-on execution.</span>
              </div>
            </nav>
          </motion.div>
          <motion.div
            className="footer-bottom"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.35 } } }}
          >
            <span>© {copyrightYear} The Sales Knob</span>
            <span>Indicative pricing · Final scope is agreed before work begins</span>
          </motion.div>
          <div className="footer-ribbon" role="group" aria-label="Connected strategy, hands-on execution, built around your next move">
            <span className="figma-visually-hidden">Connected strategy. Hands-on execution. Built around your next move.</span>
            <div className="footer-ribbon-track" aria-hidden="true">
              {[0, 1].map((copy) => (
                <div className="footer-ribbon-group" key={copy}>
                  {['CONNECTED STRATEGY', 'HANDS-ON EXECUTION', 'BUILT AROUND YOUR NEXT MOVE'].map((message) => (
                    <span className="footer-ribbon-item" key={message}>
                      {message}<ArrowLeft size={15} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <motion.div
            className="footer-legal-links"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.35 } } }}
          >
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
            <button type="button" onClick={() => setConsentBannerOpen(true)}>Privacy settings</button>
          </motion.div>
        </div>
      </motion.footer>
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="back-to-top"
            type="button"
            aria-label={`Back to top. You have scrolled ${scrollProgress} percent.`}
            title={`Back to top · ${scrollProgress}%`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.82 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.82 }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 26 }}
            whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })}
          >
            <svg className="back-to-top-progress" viewBox="0 0 64 64" aria-hidden="true">
              <circle className="back-to-top-track" cx="32" cy="32" r="27" />
              <circle
                className="back-to-top-ring"
                cx="32"
                cy="32"
                r="27"
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={2 * Math.PI * 27 * (1 - scrollProgress / 100)}
              />
            </svg>
            <span className="back-to-top-content">
              <ArrowUp size={15} strokeWidth={2.2} />
              <span>{scrollProgress}%</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {consentBannerOpen && (
          <motion.aside
            className="cookie-consent"
            aria-label="Analytics consent choices"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22 }}
          >
            <div>
              <strong>Choose your analytics settings</strong>
              <p>Necessary storage remembers your choice. Optional analytics load only after you opt in and when an analytics container is configured.</p>
            </div>
            <div className="cookie-consent-actions">
              <button type="button" onClick={() => chooseAnalyticsConsent('rejected')}>Necessary only</button>
              <button type="button" onClick={() => chooseAnalyticsConsent('accepted')}>Allow analytics</button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
