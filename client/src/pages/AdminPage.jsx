// Provides authenticated administration for service estimates and site content.
import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, Plus, Save, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const blankService = { category: '', name: '', priceLabel: '' }
const contentCollections = [
  { value: 'services', label: 'Services' },
  { value: 'case-studies', label: 'Case studies' },
  { value: 'industries', label: 'Industries' },
  { value: 'insights', label: 'Insights' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'faqs', label: 'FAQs' },
]
const contentFields = {
  services: [
    { key: 'category', label: 'Service area' },
    { key: 'audience', label: 'Who this is for', multiline: true },
    { key: 'challenges', label: 'Common challenges (one per line)', lines: true },
    { key: 'deliverables', label: 'Deliverables (one per line)', lines: true },
    { key: 'channels', label: 'Platforms / channels (one per line)', lines: true },
    { key: 'cta', label: 'Call-to-action label' },
  ],
  'case-studies': [
    { key: 'clientLabel', label: 'Client display name (optional)' },
    { key: 'industry', label: 'Industry' },
    { key: 'baseline', label: 'Baseline and source period', multiline: true },
    { key: 'intervention', label: 'Work completed', multiline: true },
    { key: 'outcome', label: 'Observed outcome and context', multiline: true },
    { key: 'source', label: 'Evidence source / record', multiline: true },
    { key: 'permissionGranted', label: 'Client approved publication', checkbox: true },
  ],
  industries: [
    { key: 'considerations', label: 'Considerations (one per line)', lines: true },
    { key: 'related', label: 'Related solution slugs (one per line)', lines: true },
  ],
  insights: [
    { key: 'sections', label: 'Sections (JSON array of heading/body objects)', json: true },
  ],
  testimonials: [
    { key: 'quote', label: 'Approved quote', multiline: true },
    { key: 'person', label: 'Client name' },
    { key: 'role', label: 'Role (optional)' },
    { key: 'company', label: 'Company (optional)' },
    { key: 'permissionGranted', label: 'Client approved publication', checkbox: true },
  ],
  faqs: [
    { key: 'question', label: 'Question', multiline: true },
    { key: 'answer', label: 'Answer', multiline: true },
    { key: 'serviceSlug', label: 'Related service slug (optional)' },
  ],
}

// Creates empty field values for the selected content collection.
function blankContentData(collection) {
  return Object.fromEntries(contentFields[collection].map(({ key, lines, json, checkbox }) => [
    key,
    lines || json ? [] : checkbox ? false : '',
  ]))
}

// Builds the default editable content form for a collection.
function newContentForm(collection = 'services') {
  return {
    id: '',
    collection,
    slug: '',
    title: '',
    summary: '',
    status: 'draft',
    imageUrl: '',
    imageAlt: '',
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    data: blankContentData(collection),
  }
}

// Converts a published entry into the editable form model.
function contentFormFromEntry(entry) {
  return {
    ...newContentForm(entry.collection),
    id: entry._id,
    slug: entry.slug,
    title: entry.title,
    summary: entry.summary,
    status: entry.status,
    imageUrl: entry.image?.url || '',
    imageAlt: entry.image?.alt || '',
    seoTitle: entry.seo?.title || '',
    seoDescription: entry.seo?.description || '',
    canonicalUrl: entry.seo?.canonicalUrl || '',
    data: { ...blankContentData(entry.collection), ...entry.data },
  }
}

// Formats list and JSON values for display in content editor controls.
function contentFieldValue(value, field) {
  if (field.lines) return Array.isArray(value) ? value.join('\n') : String(value ?? '')
  if (field.json) return typeof value === 'string' ? value : JSON.stringify(value ?? [], null, 2)
  return value ?? ''
}

// Renders login, service pricing, content CMS, and enquiry administration.
export default function AdminPage() {
  const [admin, setAdmin] = useState(null)
  const [authStatus, setAuthStatus] = useState('checking')
  const [services, setServices] = useState([])
  const [contacts, setContacts] = useState([])
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState(blankService)
  const [login, setLogin] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState('pricing')
  const [contentFilter, setContentFilter] = useState('all')
  const [contentEntries, setContentEntries] = useState([])
  const [contentForm, setContentForm] = useState(null)
  const [contentBusy, setContentBusy] = useState(false)

  // Loads the current public service estimates into the admin view.
  async function loadServices() {
    const result = await api.services()
    setServices(result.services)
  }

  // Loads submitted enquiries into the admin inbox.
  async function loadContacts() {
    const result = await api.contacts()
    setContacts(result.submissions)
  }

  // Loads all CMS entries into the admin view.
  async function loadAdminData() {
    const [{ entries }] = await Promise.all([api.contentEntries()])
    setContentEntries(entries)
  }

  useEffect(() => {
    api.currentAdmin()
      .then(async ({ admin: currentAdmin }) => {
        if (!currentAdmin) {
          setAuthStatus('anonymous')
          return
        }
        setAdmin(currentAdmin)
        setActiveAdminTab(currentAdmin.role === 'admin' ? 'pricing' : 'content')
        setAuthStatus('authenticated')
        await Promise.all([
          loadAdminData(),
          ...(currentAdmin.role === 'admin' ? [loadServices(), loadContacts()] : []),
        ])
      })
      .catch((requestError) => {
        setError(requestError.message)
        setAuthStatus('error')
      })
  }, [])

  // Copies service editor input into the current draft.
  function updateDraft(event) {
    setDraft((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  // Authenticates the administrator and loads role-appropriate data.
  async function signIn(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await api.login(login.email, login.password)
      setAdmin(result.admin)
      setActiveAdminTab(result.admin.role === 'admin' ? 'pricing' : 'content')
      setAuthStatus('authenticated')
      await Promise.all([
        loadAdminData(),
        ...(result.admin.role === 'admin' ? [loadServices(), loadContacts()] : []),
      ])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  // Ends the admin session and clears service data from the view.
  async function signOut() {
    setError('')
    try {
      await api.logout()
      setAdmin(null)
      setServices([])
      setAuthStatus('anonymous')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // Opens the selected service estimate for editing.
  function beginEdit(service) {
    setEditingId(service._id)
    setDraft({ category: service.category, name: service.name, priceLabel: service.priceLabel })
    setError('')
    setMessage('')
  }

  // Resets the service editor and exits edit mode.
  function cancelEdit() {
    setEditingId('')
    setDraft(blankService)
  }

  // Creates or updates a service estimate and refreshes the list.
  async function saveService(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (editingId && editingId !== 'new') await api.updateService(editingId, draft)
      else await api.createService(draft)
      await loadServices()
      cancelEdit()
      setMessage(editingId && editingId !== 'new' ? 'Service updated.' : 'Service added.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  // Confirms and removes a service estimate.
  async function removeService(service) {
    if (!window.confirm(`Delete “${service.name}” and its estimate?`)) return
    setError('')
    setMessage('')
    try {
      await api.deleteService(service._id)
      setServices((current) => current.filter((item) => item._id !== service._id))
      if (editingId === service._id) cancelEdit()
      setMessage('Service removed.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // Marks an enquiry as reviewed and updates its displayed status.
  async function reviewContact(contact) {
    setError('')
    try {
      await api.markContactReviewed(contact._id)
      setContacts((current) => current.map((item) => item._id === contact._id ? { ...item, status: 'reviewed' } : item))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  // Copies shared content metadata input into the content form.
  function updateContentForm(event) {
    const { name, value } = event.target
    setContentForm((current) => ({ ...current, [name]: value }))
  }

  // Updates one collection-specific content field in the form.
  function updateContentData(key, value) {
    setContentForm((current) => ({ ...current, data: { ...current.data, [key]: value } }))
  }

  // Switches the content form to a new collection's field set.
  function changeContentCollection(collection) {
    setContentForm((current) => ({
      ...current,
      collection,
      data: blankContentData(collection),
    }))
  }

  // Validates and saves a content entry, then refreshes the CMS list.
  async function saveContentEntry(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setContentBusy(true)
    try {
      const data = Object.fromEntries(contentFields[contentForm.collection].map((field) => {
        const value = contentForm.data[field.key]
        if (field.lines) {
          const items = Array.isArray(value) ? value : String(value ?? '').split(/\r?\n/)
          return [field.key, items.map((item) => item.trim()).filter(Boolean)]
        }
        if (field.json) {
          return [field.key, typeof value === 'string' ? JSON.parse(value) : value]
        }
        return [field.key, value]
      }))
      const entry = {
        collection: contentForm.collection,
        slug: contentForm.slug,
        title: contentForm.title,
        summary: contentForm.summary,
        status: contentForm.status,
        image: { url: contentForm.imageUrl, alt: contentForm.imageAlt },
        seo: {
          title: contentForm.seoTitle,
          description: contentForm.seoDescription,
          canonicalUrl: contentForm.canonicalUrl,
        },
        data,
      }
      if (contentForm.id) await api.updateContentEntry(contentForm.id, entry)
      else await api.createContentEntry(entry)
      await loadAdminData()
      setContentForm(null)
      setMessage(contentForm.id ? 'Content entry updated.' : 'Content entry created.')
    } catch (requestError) {
      setError(requestError instanceof SyntaxError
        ? 'Sections must be valid JSON. Use an array of objects with heading and body fields.'
        : requestError.message)
    } finally {
      setContentBusy(false)
    }
  }

  // Confirms and removes a content entry from the CMS.
  async function removeContentEntry(entry) {
    if (!window.confirm(`Delete “${entry.title}” from ${entry.collection}?`)) return
    setError('')
    setMessage('')
    try {
      await api.deleteContentEntry(entry._id)
      setContentEntries((current) => current.filter((item) => item._id !== entry._id))
      if (contentForm?.id === entry._id) setContentForm(null)
      setMessage('Content entry removed.')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  if (authStatus === 'checking') {
    return <section className="admin-screen"><div className="admin-card"><p role="status">Checking admin session…</p></div></section>
  }

  if (authStatus === 'error') {
    return <section className="admin-screen"><div className="admin-card"><p className="form-error" role="alert">{error}</p><button className="text-button" type="button" onClick={() => window.location.reload()}>Reload admin area</button></div></section>
  }

  if (authStatus === 'anonymous') {
    return (
      <section className="admin-screen">
        <div className="admin-card admin-login-card">
          <Link className="admin-back" to="/"><ArrowLeft size={15} /> Back to website</Link>
          <span className="eyebrow">TSK / CONTENT ADMIN</span>
          <h1>Sign in to<br /><em>manage the site.</em></h1>
          <p>Authorized administrators only. Admin accounts are provisioned by the site owner.</p>
          <form onSubmit={signIn} className="admin-login-form">
            <label>Email<input type="email" autoComplete="username" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} required /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-lime" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowLeft className="login-arrow" size={15} /></button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-screen admin-dashboard">
      <div className="container admin-container">
        <div className="admin-topbar">
          <Link className="brand" to="/"><span className="brand-mark">TSK<span>.</span></span><span className="brand-name">CONTENT ADMIN</span></Link>
          <div><span className="admin-user">{admin?.email}</span><button className="text-button" type="button" onClick={signOut}>Sign out <LogOut size={14} /></button></div>
        </div>
        <nav className="admin-tabs" aria-label="Admin sections">
          {admin?.role === 'admin' && <button className={activeAdminTab === 'pricing' ? 'is-active' : ''} type="button" onClick={() => setActiveAdminTab('pricing')}>Pricing</button>}
          <button className={activeAdminTab === 'content' ? 'is-active' : ''} type="button" onClick={() => setActiveAdminTab('content')}>Content CMS</button>
          {admin?.role === 'admin' && <button className={activeAdminTab === 'enquiries' ? 'is-active' : ''} type="button" onClick={() => setActiveAdminTab('enquiries')}>Enquiries</button>}
        </nav>
        {(error || message) && <p className={error ? 'admin-alert error' : 'admin-alert success'} role={error ? 'alert' : 'status'}>{error || message}</p>}
        {activeAdminTab === 'pricing' && admin?.role === 'admin' && (
          <>
            <div className="admin-heading">
              <div><span className="eyebrow eyebrow-dark">SERVICE DIRECTORY</span><h1>Manage <em>estimates.</em></h1><p>Updates are published to the public services pages as soon as they’re saved.</p></div>
              <button className="button button-dark" type="button" onClick={() => { cancelEdit(); setError(''); setMessage(''); setEditingId('new') }}><Plus size={16} /> Add a service</button>
            </div>
            {editingId && (
              <form className="service-editor" onSubmit={saveService}>
                <div className="editor-heading"><h2>{editingId === 'new' ? 'Add a service' : 'Edit service'}</h2><button className="icon-button" type="button" onClick={cancelEdit} aria-label="Cancel editing"><X size={18} /></button></div>
                <label>Service area<input name="category" value={draft.category} onChange={updateDraft} required maxLength={100} placeholder="e.g. E-commerce Development" /></label>
                <label>Service name<input name="name" value={draft.name} onChange={updateDraft} required maxLength={140} placeholder="e.g. Shopify store development" /></label>
                <label>Indicative price (INR)<input name="priceLabel" value={draft.priceLabel} onChange={updateDraft} required maxLength={100} placeholder="e.g. ₹8,000 – ₹20,000" /></label>
                <button className="button button-lime" type="submit" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save changes'}</button>
              </form>
            )}
            <div className="admin-services-list">
              {services.map((service) => (
                <article className="admin-service-row" key={service._id}>
                  <div><span>{service.category}</span><h2>{service.name}</h2></div>
                  <strong>{service.priceLabel}</strong>
                  <div className="admin-row-actions"><button className="text-button" type="button" onClick={() => beginEdit(service)}>Edit</button><button className="icon-button delete-button" type="button" onClick={() => removeService(service)} aria-label={`Delete ${service.name}`}><Trash2 size={16} /></button></div>
                </article>
              ))}
              {services.length === 0 && <p>No services are listed yet. Add the first service to get started.</p>}
            </div>
            <Link className="admin-view-link" to="/services" target="_blank" rel="noreferrer">View public service directory <ArrowLeft size={14} /></Link>
          </>
        )}
        {activeAdminTab === 'content' && (
          <>
            <div className="admin-heading">
              <div><span className="eyebrow eyebrow-dark">EDITORIAL WORKSPACE</span><h1>Manage <em>content.</em></h1><p>Save drafts, publish approved content, and set image accessibility and search metadata.</p></div>
              <button className="button button-dark" type="button" onClick={() => { setContentForm(newContentForm()); setError(''); setMessage('') }}><Plus size={16} /> Add content</button>
            </div>
            {contentForm && (
              <form className="service-editor cms-editor" onSubmit={saveContentEntry}>
                <div className="editor-heading"><h2>{contentForm.id ? 'Edit content' : 'Create content'}</h2><button className="icon-button" type="button" onClick={() => setContentForm(null)} aria-label="Cancel content editing"><X size={18} /></button></div>
                <label>Collection<select name="collection" value={contentForm.collection} disabled={Boolean(contentForm.id)} onChange={(event) => changeContentCollection(event.target.value)}>{contentCollections.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}</select></label>
                <label>URL slug<input name="slug" value={contentForm.slug} onChange={updateContentForm} required maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="example-content-slug" /></label>
                <label>Title<input name="title" value={contentForm.title} onChange={updateContentForm} required maxLength={180} /></label>
                <label className="cms-wide">Summary<textarea name="summary" value={contentForm.summary} onChange={updateContentForm} required maxLength={1000} rows={3} /></label>
                {contentFields[contentForm.collection].map((field) => (
                  field.checkbox
                    ? <label className="cms-checkbox" key={field.key}><input type="checkbox" checked={Boolean(contentForm.data[field.key])} onChange={(event) => updateContentData(field.key, event.target.checked)} />{field.label}</label>
                    : <label className={field.multiline || field.lines || field.json ? 'cms-wide' : ''} key={field.key}>{field.label}
                      {field.multiline || field.lines || field.json
                        ? <textarea value={contentFieldValue(contentForm.data[field.key], field)} onChange={(event) => updateContentData(field.key, event.target.value)} rows={field.json ? 9 : 4} required={!['cta', 'clientLabel', 'role', 'company', 'serviceSlug'].includes(field.key)} />
                        : <input value={contentFieldValue(contentForm.data[field.key], field)} onChange={(event) => updateContentData(field.key, event.target.value)} required={!['cta', 'clientLabel', 'role', 'company', 'serviceSlug'].includes(field.key)} />}
                    </label>
                ))}
                <label>Image URL (optional)<input name="imageUrl" type="url" value={contentForm.imageUrl} onChange={updateContentForm} maxLength={500} /></label>
                <label>Image alt text<input name="imageAlt" value={contentForm.imageAlt} onChange={updateContentForm} maxLength={300} /></label>
                <label>SEO title<input name="seoTitle" value={contentForm.seoTitle} onChange={updateContentForm} maxLength={180} /></label>
                <label>Canonical URL<input name="canonicalUrl" value={contentForm.canonicalUrl} onChange={updateContentForm} maxLength={500} placeholder="/content/path or https://…" /></label>
                <label className="cms-wide">SEO description<textarea name="seoDescription" value={contentForm.seoDescription} onChange={updateContentForm} maxLength={500} rows={2} /></label>
                <label>Publication status<select name="status" value={contentForm.status} onChange={updateContentForm}><option value="draft">Draft</option><option value="published">Published</option></select></label>
                <div className="cms-publish-note">Publishing case studies and testimonials requires documented permission. Text is rendered as plain text; HTML is not accepted.</div>
                <button className="button button-lime" type="submit" disabled={contentBusy}><Save size={15} /> {contentBusy ? 'Saving…' : contentForm.status === 'published' ? 'Save and publish' : 'Save draft'}</button>
              </form>
            )}
            <div className="cms-list-toolbar">
              <label>Filter collection<select value={contentFilter} onChange={(event) => setContentFilter(event.target.value)}><option value="all">All collections</option>{contentCollections.map(({ value, label }) => <option value={value} key={value}>{label}</option>)}</select></label>
              <span>{contentEntries.filter((entry) => contentFilter === 'all' || entry.collection === contentFilter).length} entries</span>
            </div>
            <div className="cms-entry-list">
              {contentEntries.filter((entry) => contentFilter === 'all' || entry.collection === contentFilter).map((entry) => (
                <article className="cms-entry-row" key={entry._id}>
                  <div><span>{entry.collection} · {entry.status}</span><h2>{entry.title}</h2><p>/{entry.collection}/{entry.slug}</p></div>
                  <div className="admin-row-actions"><button className="text-button" type="button" onClick={() => { setContentForm(contentFormFromEntry(entry)); setError(''); setMessage('') }}>Edit</button><button className="icon-button delete-button" type="button" onClick={() => removeContentEntry(entry)} aria-label={`Delete ${entry.title}`}><Trash2 size={16} /></button></div>
                </article>
              ))}
              {contentEntries.length === 0 && <p>No content entries yet. Create a draft to get started.</p>}
            </div>
          </>
        )}
        {activeAdminTab === 'enquiries' && admin?.role === 'admin' && (
          <>
            <div className="admin-inbox-heading">
              <div><span className="eyebrow eyebrow-dark">CONTACT FORM / PRIVATE INBOX</span><h2>Enquiries <span>{contacts.length}</span></h2></div>
            </div>
            <div className="admin-inbox">
              {contacts.map((contact) => (
                <article className={`admin-contact${contact.status === 'reviewed' ? ' is-reviewed' : ''}`} key={contact._id}>
                  <div className="admin-contact-heading">
                    <div><span>{contact.createdAt?.slice(0, 10)} · {contact.status}</span><h3>{contact.name}</h3></div>
                    {contact.status === 'new' && <button className="text-button" type="button" onClick={() => reviewContact(contact)}>Mark reviewed</button>}
                  </div>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                  <p>{contact.challenge}</p>
                  <div className="admin-contact-meta">
                    {contact.company && <span>{contact.company}</span>}
                    {contact.phone && <span>{contact.phone}</span>}
                    {contact.website && <span>{contact.website}</span>}
                    {contact.market && <span>{contact.market}</span>}
                    {contact.platform && <span>{contact.platform}</span>}
                    {contact.budget && <span>{contact.budget}</span>}
                    {contact.attribution?.source && <span>Source: {contact.attribution.source}</span>}
                    {contact.attribution?.medium && <span>Medium: {contact.attribution.medium}</span>}
                    {contact.attribution?.campaign && <span>Campaign: {contact.attribution.campaign}</span>}
                  </div>
                </article>
              ))}
              {contacts.length === 0 && <p>No enquiries yet.</p>}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
