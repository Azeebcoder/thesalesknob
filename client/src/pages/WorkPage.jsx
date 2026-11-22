// Presents approved case studies and testimonials when published.
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublishedContent } from '../lib/usePublishedContent'
import { TextReveal } from '../components/TextReveal'

// Renders evidence standards and available work content.
export default function WorkPage() {
  const { entries: caseStudies } = usePublishedContent('case-studies')
  const { entries: testimonials } = usePublishedContent('testimonials')

  return (
    <div className="figma-page content-route">
      <section className="route-hero">
        <div className="figma-container">
          <p className="figma-kicker">OUR WORK / EVIDENCE FIRST</p>
          <h1><TextReveal variant="flip">The work behind<br /><em>the numbers.</em></TextReveal></h1>
          <p className="route-hero-copy">
            {caseStudies.length
              ? 'Explore approved work with a clear baseline, documented intervention, useful outcome context and client permission.'
              : 'Useful case studies need an agreed baseline, a clear intervention, context for the outcome and client permission. No client results or logos have been supplied for publication yet, so we will not invent them.'}
          </p>
          <Link className="figma-button figma-button-dark" to="/contact">Ask about relevant experience <ArrowRight size={16} /></Link>
        </div>
      </section>
      <section className="route-section">
        <div className="figma-container work-readiness">
          <p className="figma-kicker">CASE STUDY STANDARD</p>
          <h2><TextReveal variant="slide">Show the full<br /><em>business context.</em></TextReveal></h2>
          <ul className="route-deliverables">
            <li><span>Starting problem, baseline period and data source</span></li>
            <li><span>Intervention and the work actually completed</span></li>
            <li><span>Outcome with relevant context and limitations</span></li>
            <li><span>Client approval for the story, visuals and identifying details</span></li>
          </ul>
          {caseStudies.length === 0 && <p className="figma-placeholder-note">Case studies will be published only after evidence and client permissions are confirmed.</p>}
        </div>
      </section>
      {caseStudies.length > 0 && (
        <section className="route-section route-section-soft">
          <div className="figma-container">
            <p className="figma-kicker">APPROVED CASE STUDIES</p>
            <div className="route-card-grid">
              {caseStudies.map((entry) => (
                <article className="route-card work-case-study" key={entry._id}>
                  {entry.image?.url && <img src={entry.image.url} alt={entry.image.alt} loading="lazy" />}
                  <span className="route-card-index">{entry.data.industry}</span>
                  <h2>{entry.title}</h2>
                  <p>{entry.summary}</p>
                  <dl>
                    <dt>Starting point</dt><dd>{entry.data.baseline}</dd>
                    <dt>Work completed</dt><dd>{entry.data.intervention}</dd>
                    <dt>Observed outcome</dt><dd>{entry.data.outcome}</dd>
                  </dl>
                  <p className="figma-placeholder-note">Evidence source: {entry.data.source}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="route-section">
          <div className="figma-container">
            <p className="figma-kicker">CLIENT PERSPECTIVES</p>
            <div className="route-card-grid">
              {testimonials.map((entry) => (
                <blockquote className="route-card" key={entry._id}>
                  <p>“{entry.data.quote}”</p>
                  <footer>{entry.data.person}{entry.data.role && ` · ${entry.data.role}`}{entry.data.company && ` · ${entry.data.company}`}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="route-cta">
        <div className="figma-container">
          <p className="figma-kicker figma-kicker-light">HAVE A QUESTION FOR THE TEAM?</p>
          <h2><TextReveal variant="pop">Start with your<br /><em>growth challenge.</em></TextReveal></h2>
          <Link className="figma-button figma-button-light" to="/contact">Start a conversation <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
