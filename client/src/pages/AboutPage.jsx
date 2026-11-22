// Presents the agency approach, capabilities, and technical skill profile.
import { ArrowUpRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { capabilities, skillGroups } from '../data/content'
import { TextReveal } from '../components/TextReveal'

// Renders the about page with shared section-reveal animation settings.
export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion()
  // Returns reduced-motion-aware reveal props for an about-page section.
  const revealSection = (delay = 0) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.14 },
    transition: { duration: shouldReduceMotion ? 0 : 0.55, delay: shouldReduceMotion ? 0 : delay },
  })

  return (
    <div className="figma-page">
      <motion.section
        className="inner-hero about-hero"
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
          <span className="eyebrow">ABOUT / A CONNECTED OPERATING PARTNER</span>
          <h1><TextReveal variant="flip">Built for brands<br />that refuse to<br /><em>stand still.</em></TextReveal></h1>
          <p>The Sales Knob brings marketplace operations, performance marketing, creative and digital commerce into a coordinated growth partnership—working from the details toward the bigger commercial goal.</p>
          <Link className="button button-lime" to="/contact">Start a conversation <ArrowUpRight size={16} /></Link>
        </motion.div>
      </motion.section>
      <motion.section className="section about-story" {...revealSection()}>
        <div className="container split-heading">
          <div><span className="eyebrow eyebrow-dark">THE POINT OF VIEW</span><h2><TextReveal variant="slide">One business.<br /><em>One connected plan.</em></TextReveal></h2></div>
          <div className="split-copy">
            <p className="lead-copy">Channels don’t grow a brand on their own. The useful work happens when the offer, customer experience, creative, technology and measurement reinforce each other.</p>
            <p>That is the idea behind The Sales Knob: bring the right capabilities together, stay close to the details, and make the next decision with context. No inflated guarantees. No borrowed case-study numbers.</p>
          </div>
        </div>
      </motion.section>
      <motion.section className="section capability-section about-capabilities" {...revealSection()}>
        <div className="container capability-layout">
          <div><span className="eyebrow">A PRACTICAL TOOLKIT</span><h2><TextReveal variant="rise">Strategy with<br /><em>hands-on range.</em></TextReveal></h2><p className="capability-intro">Digital and engineering services support the growth work where they create a better customer or operating experience.</p></div>
          <div className="capability-list">
            {capabilities.map((item, index) => (
              <motion.article
                className="capability-item"
                key={item.label}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.42, delay: shouldReduceMotion ? 0 : index * 0.055 }}
              >
                <span>{item.label}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
                <Check size={16} />
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>
      <motion.section className="section skills-section" {...revealSection()}>
        <div className="container skills-layout">
          <div><span className="eyebrow eyebrow-dark">PERSONAL PROFILE / TECHNICAL SKILLS</span><h2><TextReveal variant="pop">Build the right<br /><em>thing, well.</em></TextReveal></h2><p>Capabilities listed in the supplied profile, brought into projects where they fit.</p></div>
          <div className="skills-grid">
            {skillGroups.map(([title, detail], index) => (
              <motion.article
                className="skill-card"
                key={title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.38, delay: shouldReduceMotion ? 0 : index * 0.05 }}
              >
                <span>{title}</span><p>{detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>
      <motion.section className="about-contact-band" {...revealSection()}>
        <div className="container about-contact-inner">
          <p>Have a specific challenge in mind?</p><Link className="button button-lime" to="/contact">Tell us about it <ArrowUpRight size={16} /></Link>
        </div>
      </motion.section>
    </div>
  )
}
