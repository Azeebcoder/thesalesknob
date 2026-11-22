// Exposes JSON API methods for public content, contact forms, and administration.
// Sends a request and converts non-success responses into errors with status codes.
async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(body.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return body
}

// Collects endpoint-specific requests used by frontend features.
export const api = {
  // Retrieves the public service estimate catalog.
  services: () => request('/services'),
  // Starts an administrator session with the supplied credentials.
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  // Checks the current administrator session.
  currentAdmin: () => request('/auth/me'),
  // Ends the current administrator session.
  logout: () => request('/auth/logout', { method: 'POST' }),
  // Creates a service estimate.
  createService: (service) =>
    request('/services', { method: 'POST', body: JSON.stringify(service) }),
  // Updates a service estimate by identifier.
  updateService: (id, service) =>
    request(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(service),
    }),
  // Deletes a service estimate by identifier.
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),
  // Retrieves contact submissions for the admin inbox.
  contacts: () => request('/contact'),
  // Marks a contact submission as reviewed.
  markContactReviewed: (id) => request(`/contact/${id}/reviewed`, { method: 'PATCH' }),
  // Submits a public contact enquiry.
  contact: (data) =>
    request('/contact', { method: 'POST', body: JSON.stringify(data) }),
  // Retrieves manageable content entries, optionally limited to a collection.
  contentEntries: (collection) =>
    request(`/content/manage${collection ? `?collection=${encodeURIComponent(collection)}` : ''}`),
  // Retrieves published content in a collection.
  publicContent: (collection) => request(`/content?collection=${encodeURIComponent(collection)}`),
  // Retrieves one published content entry by collection and slug.
  publicContentEntry: (collection, slug) =>
    request(`/content/${encodeURIComponent(collection)}/${encodeURIComponent(slug)}`),
  // Creates a content entry in the CMS.
  createContentEntry: (entry) =>
    request('/content', { method: 'POST', body: JSON.stringify(entry) }),
  // Updates a CMS content entry by identifier.
  updateContentEntry: (id, entry) =>
    request(`/content/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(entry) }),
  // Deletes a CMS content entry by identifier.
  deleteContentEntry: (id) =>
    request(`/content/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
