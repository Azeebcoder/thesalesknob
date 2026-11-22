// Lists industry contexts and renders details for a selected industry route.
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { industryPages, solutionPages } from '../data/growthPages'
import { usePublishedContent } from '../lib/usePublishedContent'
import { TextReveal } from '../components/TextReveal'

// Combines static and published industry entries into list and detail pages.
export default function IndustriesPage() {
  const { slug } = useParams()
  const { entries, loading } = usePublishedContent('industries')
  const industries = new Map(industryPages.map((industryPage) => [industryPage.slug, industryPage]))
  entries.forEach((entry) => industries.set(entry.slug, {
    slug: entry.slug,
    title: entry.title,
    description: entry.summary,
    considerations: entry.data.considerations,
    related: entry.data.related,
  }))
  const pages = [...industries.values()]
  const industry = slug ? industries.get(slug) : null
  if (slug && !industry && loading) return <div className="page-loader" role="status">Loading industry…</div>
  if (slug && !industry) return <Navigate to="/404" replace />

  return (
    <div className="figma-page content-route">
      <section className="route-hero">
        <div className="figma-container">
          <p className="figma-kicker">{industry ? 'INDUSTRY / OPERATING CONTEXT' : 'INDUSTRIES / CATEGORY CONTEXT'}</p>
          <h1><TextReveal variant="pop">{industry ? industry.title : <>Different categories.<br /><em>Thoughtful playbooks.</em></>}</TextReveal></h1>
          <p className="route-hero-copy">
            {industry
              ? industry.description
              : 'Explore the operating questions that can shape marketplace, creative, commerce and measurement priorities. The right plan depends on your products and constraints.'}
          </p>
          <Link className="figma-button figma-button-dark" to="/contact">Discuss your category <ArrowRight size={16} /></Link>
        </div>
      </section>
      {industry ? (
        <>
          <section className="route-section">
            <div className="figma-container route-detail-grid">
              <div className="route-detail-intro">
                <p className="figma-kicker">QUESTIONS TO CONSIDER</p>
                <h2><TextReveal variant="slide">Start with your<br /><em>customer and offer.</em></TextReveal></h2>
                <p>These are discovery prompts, not assumptions about your business or guaranteed outcomes.</p>
              </div>
              <ul className="route-deliverables">
                {industry.considerations.map((item) => <li key={item}><span>{item}</span></li>)}
              </ul>
            </div>
          </section>
          <section className="route-section route-section-soft">
            <div className="figma-container">
              <p className="figma-kicker">RELATED CAPABILITIES</p>
              <div className="route-link-list">
                {industry.related.map((relatedSlug) => {
                  const solution = solutionPages.find((item) => item.slug === relatedSlug)
                  return solution ? (
                    <Link to={`/solutions/${solution.slug}`} key={solution.slug}>
                      <span><small>{solution.category}</small>{solution.headline}</span><ArrowUpRight size={17} />
                    </Link>
                  ) : null
                })}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="route-section">
          <div className="figma-container route-card-grid">
            {pages.map((item, index) => (
              <Link className="route-card" to={`/industries/${item.slug}`} key={item.slug}>
                <span className="route-card-index">{String(index + 1).padStart(2, '0')} / INDUSTRY</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <span className="route-card-link">Explore considerations <ArrowUpRight size={15} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="route-cta">
        <div className="figma-container">
          <p className="figma-kicker figma-kicker-light">START WITH THE CONTEXT</p>
          <h2><TextReveal variant="flip">Different categories.<br /><em>One useful next step.</em></TextReveal></h2>
          <Link className="figma-button figma-button-light" to="/contact">Tell us about your business <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
