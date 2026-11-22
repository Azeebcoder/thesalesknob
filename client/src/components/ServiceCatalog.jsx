// Loads and displays grouped service estimates with loading and error states.
import { useEffect, useState } from 'react'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const categoryRoutes = {
  'Website & Web Application Development': 'web-development',
  'Enterprise Software & Management Systems': 'enterprise-systems',
  'AI & Intelligent Solutions': 'ai-solutions',
  'Mobile Application Development': 'mobile-app-development',
  'Data Analytics & Dashboard Development': 'analytics-dashboards',
  'E-commerce Development': 'ecommerce-development',
  'UI/UX Design & Figma Prototyping': 'ui-ux-design',
  'Cloud Infrastructure & DevOps Management': 'cloud-devops',
  'Cybersecurity & Penetration Testing': 'cybersecurity',
  'Social Media & Digital Marketing': 'social-media',
}

// Renders service estimates and provides a retry action when loading fails.
export function ServiceCatalog({ compact = false, highlightCategories = [] }) {
  const shouldReduceMotion = useReducedMotion()
  const [services, setServices] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  // Retries loading the latest service estimates after a failed request.
  async function loadServices() {
    setStatus('loading')
    setError('')
    try {
      const result = await api.services()
      setServices(result.services)
      setStatus('ready')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('error')
    }
  }

  useEffect(() => {
    let active = true
    api.services()
      .then((result) => {
        if (!active) return
        setServices(result.services)
        setStatus('ready')
      })
      .catch((requestError) => {
        if (!active) return
        setError(requestError.message)
        setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  if (status === 'loading') {
    return <p className="catalog-state" role="status">Loading current service estimates…</p>
  }

  if (status === 'error') {
    return (
      <div className="catalog-state catalog-error" role="alert">
        <p>Service estimates could not be loaded. {error}</p>
        <button className="text-button" type="button" onClick={loadServices}>
          Try again <RefreshCw size={14} />
        </button>
      </div>
    )
  }

  const groups = services.reduce((result, service) => {
    const category = result.find((item) => item.name === service.category)
    if (category) category.services.push(service)
    else result.push({ name: service.category, services: [service] })
    return result
  }, [])
  const visibleGroups = compact
    ? highlightCategories.length
      ? groups.filter((group) => highlightCategories.includes(group.name))
      : groups.slice(0, 4)
    : groups

  return (
    <div className={`price-groups${compact ? ' price-groups-compact' : ''}`}>
      {visibleGroups.map((group, index) => (
        <motion.article
          className="price-group"
          key={group.name}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.42, delay: shouldReduceMotion ? 0 : index * 0.055 }}
        >
          <div className="price-group-heading">
            <span className="eyebrow">{String(groups.indexOf(group) + 1).padStart(2, '0')} / SERVICE AREA</span>
            <h3>{group.name}</h3>
          </div>
          <div className="price-list">
            {group.services.map((service) => (
              <div className="price-row" key={service._id || service.slug}>
                <span>{service.name}</span>
                <strong>{service.priceLabel}</strong>
              </div>
            ))}
          </div>
          <Link className="price-group-link" to={categoryRoutes[group.name] ? `/solutions/${categoryRoutes[group.name]}` : '/solutions'}>
            Explore scope <ArrowUpRight size={14} />
          </Link>
        </motion.article>
      ))}
      <p className="pricing-note">
        Indicative estimates in INR. Final pricing depends on scope and requirements. Domain, hosting,
        paid APIs and third-party licenses are separate. Security testing is performed only with explicit authorization.
      </p>
      {compact && (
        <Link className="button button-outline" to="/services">
          View all services and estimates <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  )
}
