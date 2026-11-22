// Presents indicative service estimates and explains how final scope is set.
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ServiceCatalog } from '../components/ServiceCatalog'
import { TextReveal } from '../components/TextReveal'

// Renders the service directory and estimate guidance.
export default function ServicesPage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="figma-page">
      <motion.section
        className="inner-hero"
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
      >
        <motion.div
          className="container inner-hero-content"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: shouldReduceMotion ? 0 : 0.08 }}
        >
          <span className="eyebrow">SERVICES / INDICATIVE ESTIMATES</span>
          <h1><TextReveal variant="slide">Useful work.<br /><em>Clear starting points.</em></TextReveal></h1>
          <p>Explore the capabilities and indicative pricing behind the work. Every engagement is scoped to your goals, complexity and requirements.</p>
          <Link className="button button-lime" to="/contact">Discuss your requirements <ArrowUpRight size={16} /></Link>
        </motion.div>
      </motion.section>
      <motion.section
        className="section all-prices-section"
        id="pricing"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
      >
        <div className="container">
          <div className="section-heading compact-heading">
            <div><span className="eyebrow eyebrow-dark">SERVICE DIRECTORY</span><h2><TextReveal variant="flip">Find a place<br />to <em>begin.</em></TextReveal></h2></div>
            <p>All prices are in INR. Estimates may change with project scope. Paid APIs, domains, hosting and third-party licenses are separate.</p>
          </div>
          <ServiceCatalog />
        </div>
      </motion.section>
      <motion.section
        className="section pricing-footnote"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      >
        <div className="container">
          <p>Custom enterprise and AI projects are quoted after requirement analysis. Payment milestones are agreed before work begins. Maintenance and support can be arranged separately.</p>
          <Link className="inline-link" to="/contact">Ask for a scoped estimate <ArrowUpRight size={15} /></Link>
        </div>
      </motion.section>
    </div>
  )
}
