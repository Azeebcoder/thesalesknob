// Lists practical insight articles and renders their section content.
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { insightArticles } from '../data/growthPages'
import { usePublishedContent } from '../lib/usePublishedContent'
import { TextReveal } from '../components/TextReveal'

// Combines static and published articles into list and detail views.
export default function InsightsPage() {
  const { slug } = useParams()
  const { entries, loading } = usePublishedContent('insights')
  const articles = new Map(insightArticles.map((articleItem) => [articleItem.slug, articleItem]))
  entries.forEach((entry) => articles.set(entry.slug, {
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    sections: entry.data.sections.map(({ heading, body }) => [heading, body]),
  }))
  const articleList = [...articles.values()]
  const article = slug ? articles.get(slug) : null
  if (slug && !article && loading) return <div className="page-loader" role="status">Loading insight…</div>
  if (slug && !article) return <Navigate to="/404" replace />

  return (
    <div className="figma-page content-route">
      <section className="route-hero">
        <div className="figma-container">
          <p className="figma-kicker">{article ? 'INSIGHTS / PRACTICAL NOTES' : 'INSIGHTS / THE GROWTH CONTROL ROOM'}</p>
          <h1><TextReveal variant="slide">{article ? article.title : <>Useful questions.<br /><em>Clearer decisions.</em></>}</TextReveal></h1>
          <p className="route-hero-copy">
            {article
              ? article.summary
              : 'Short, practical frameworks for connecting marketplace operations, performance marketing, creative and technology.'}
          </p>
          {article && <Link className="figma-text-link" to="/insights"><ArrowLeft size={15} /> All insights</Link>}
        </div>
      </section>
      {article ? (
        <article className="route-section">
          <div className="figma-container insight-article">
            {article.sections.map(([heading, body], index) => (
              <section key={heading}>
                <p className="figma-kicker">{String(index + 1).padStart(2, '0')} / CONSIDERATION</p>
                <h2><TextReveal variant="pop">{heading}</TextReveal></h2>
                <p>{body}</p>
              </section>
            ))}
            <p className="figma-placeholder-note">General planning guidance only. Apply it to your business context; it is not a promise of performance.</p>
          </div>
        </article>
      ) : (
        <section className="route-section">
          <div className="figma-container route-card-grid">
            {articleList.map((item) => (
              <Link className="route-card" to={`/insights/${item.slug}`} key={item.slug}>
                <span className="route-card-index">PRACTICAL NOTE</span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <span className="route-card-link">Read the note <ArrowUpRight size={15} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className="route-cta">
        <div className="figma-container">
          <p className="figma-kicker figma-kicker-light">PUT THE CONTEXT TO WORK</p>
          <h2><TextReveal variant="flip">Bring us the<br /><em>business question.</em></TextReveal></h2>
          <Link className="figma-button figma-button-light" to="/contact">Talk to the team <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
