// Synchronizes document metadata with the current route and published content.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMeta } from '../data/growthPages'
import { api } from '../lib/api'

// Keeps the page title and metadata aligned with the active route.
export function Seo() {
  const { pathname } = useLocation()
  const normalizedPathname = pathname === '/' ? pathname : pathname.replace(/\/+$/, '')
  const meta = getPageMeta(normalizedPathname)

  useEffect(() => {
    document.title = meta.title
    // Creates or updates a metadata element with the supplied attribute value.
    const setMetaContent = (selector, attribute, value) => {
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        document.head.append(element)
      }
      element.setAttribute(attribute, value)
    }

    setMetaContent('meta[name="description"]', 'content', meta.description)
    setMetaContent('meta[property="og:title"]', 'content', meta.title)
    setMetaContent('meta[property="og:description"]', 'content', meta.description)
    setMetaContent('meta[property="og:type"]', 'content', 'website')
    setMetaContent('meta[property="og:url"]', 'content', new URL(normalizedPathname, import.meta.env.VITE_SITE_URL || window.location.origin).href)
    setMetaContent('meta[name="twitter:card"]', 'content', 'summary')
    setMetaContent('meta[name="twitter:title"]', 'content', meta.title)
    setMetaContent('meta[name="twitter:description"]', 'content', meta.description)

    document.querySelector('meta[name="robots"]')?.remove()
    if (meta.noIndex) {
      const robots = document.createElement('meta')
      robots.name = 'robots'
      robots.content = 'noindex, nofollow'
      document.head.append(robots)
    }
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.append(canonical)
    }
    canonical.href = new URL(normalizedPathname, import.meta.env.VITE_SITE_URL || window.location.origin).href
  }, [meta, normalizedPathname])

  useEffect(() => {
    const match = normalizedPathname.match(/^\/(solutions|industries|insights)\/([^/]+)$/)
    if (!match) return undefined

    const collection = { solutions: 'services', industries: 'industries', insights: 'insights' }[match[1]]
    let active = true
    api.publicContentEntry(collection, match[2])
      .then(({ entry }) => {
        if (!active) return
        const title = entry.seo?.title || `${entry.title} — The Sales Knob`
        const description = entry.seo?.description || entry.summary
        document.title = title
        document.querySelector('meta[name="description"]')?.setAttribute('content', description)
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
        const canonical = document.querySelector('link[rel="canonical"]')
        const canonicalUrl = entry.seo?.canonicalUrl || new URL(normalizedPathname, import.meta.env.VITE_SITE_URL || window.location.origin).href
        if (canonical) {
          canonical.href = canonicalUrl
        }
        document.querySelector('meta[property="og:url"]')?.setAttribute('content', new URL(canonicalUrl, window.location.origin).href)
      })
      .catch((error) => {
        if (error.status !== 404) console.error('Could not load CMS SEO metadata:', error)
      })

    return () => {
      active = false
    }
  }, [normalizedPathname])

  return null
}
