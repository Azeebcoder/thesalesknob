// Manages consent-aware analytics loading, event tracking, and campaign attribution.
const consentStorageKey = 'tsk-analytics-consent'
const attributionStorageKey = 'tsk-campaign-attribution'
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
let loadedContainerId = ''

// Reads a browser-storage value without failing when storage is unavailable.
function readStorage(storage, key) {
  try {
    return storage.getItem(key)
  } catch (error) {
    console.warn(`Unable to read ${key} from browser storage.`, error)
    return null
  }
}

// Saves a browser-storage value without failing when storage is unavailable.
function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value)
  } catch (error) {
    console.warn(`Unable to save ${key} to browser storage.`, error)
  }
}

// Returns the saved analytics choice, or null when no valid choice exists.
export function getAnalyticsConsent() {
  if (typeof window === 'undefined') return null
  const saved = readStorage(window.localStorage, consentStorageKey)
  return saved === 'accepted' || saved === 'rejected' ? saved : null
}

// Validates and stores analytics consent, then notifies the application.
export function setAnalyticsConsent(consent) {
  if (consent !== 'accepted' && consent !== 'rejected') {
    throw new TypeError('Analytics consent must be accepted or rejected.')
  }
  if (typeof window === 'undefined') return
  writeStorage(window.localStorage, consentStorageKey, consent)
  window.dispatchEvent(new CustomEvent('tsk:consent-change', { detail: consent }))
}

// Loads the configured analytics container only after the visitor opts in.
export function initializeAnalytics(containerId) {
  if (typeof window === 'undefined' || !containerId || getAnalyticsConsent() !== 'accepted') return
  if (loadedContainerId === containerId) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`
  script.dataset.tskAnalytics = 'true'
  document.head.append(script)
  loadedContainerId = containerId
}

// Pushes an analytics event only when consent and the container are active.
export function trackEvent(eventName, parameters = {}) {
  if (typeof window === 'undefined' || getAnalyticsConsent() !== 'accepted') return
  if (!import.meta.env.VITE_GTM_ID || !loadedContainerId) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...parameters })
}

// Reads campaign parameters and retains the first campaign attribution per session.
export function getCampaignAttribution() {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const hasCampaign = campaignKeys.some((key) => params.has(key))
  const saved = readStorage(window.sessionStorage, attributionStorageKey)
  let attribution = {}
  if (saved) {
    try {
      attribution = JSON.parse(saved)
    } catch (error) {
      console.warn('Saved campaign attribution was invalid and has been ignored.', error)
    }
  }

  if (hasCampaign) {
    const campaign = Object.fromEntries(campaignKeys
      .map((key) => [key.slice(4), params.get(key)?.trim().slice(0, 100)])
      .filter(([, value]) => value))
    const referrerUrl = document.referrer ? new URL(document.referrer) : null
    attribution = {
      ...campaign,
      ...attribution,
      landingPage: attribution.landingPage || window.location.pathname.slice(0, 500),
      referrer: attribution.referrer || (referrerUrl ? `${referrerUrl.origin}${referrerUrl.pathname}`.slice(0, 500) : ''),
    }
    writeStorage(window.sessionStorage, attributionStorageKey, JSON.stringify(attribution))
  }

  return attribution
}
