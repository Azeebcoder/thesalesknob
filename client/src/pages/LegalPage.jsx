// Displays the legal-information draft associated with the current route.
import { Link, Navigate, useLocation } from 'react-router-dom'
import { legalPages } from '../data/growthPages'
import { TextReveal } from '../components/TextReveal'

// Selects and renders privacy, terms, or cookie information by pathname.
export default function LegalPage() {
  const { pathname } = useLocation()
  const normalizedPathname = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  const page = legalPages[normalizedPathname]
  if (!page) return <Navigate to="/404" replace />

  return (
    <div className="figma-page content-route">
      <section className="route-hero">
        <div className="figma-container">
          <p className="figma-kicker">SITE INFORMATION / OWNER REVIEW</p>
          <h1><TextReveal variant="pop">{page.title}</TextReveal></h1>
          <p className="route-hero-copy">{page.description}</p>
          {normalizedPathname === '/cookies' && (
            <button className="figma-button figma-button-outline" type="button" onClick={() => window.dispatchEvent(new Event('tsk:manage-consent'))}>
              Manage analytics choices
            </button>
          )}
        </div>
      </section>
      <article className="route-section">
        <div className="figma-container legal-content">
          <p className="figma-placeholder-note">Draft for review: confirm the legal business identity, jurisdiction, retention details and contact process with the site owner and legal counsel before launch.</p>
          {page.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2>{heading}</h2>
              <p>{body}</p>
            </section>
          ))}
          <p>Questions about this website? <Link to="/contact">Contact the team</Link>.</p>
        </div>
      </article>
    </div>
  )
}
