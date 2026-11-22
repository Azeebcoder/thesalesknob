import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import {
  getPageMeta,
  industryPages,
  insightArticles,
  legalPages,
  publicPagePaths,
  solutionPages,
} from '../src/data/growthPages.js'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(scriptDir, '../dist')
const clientDir = resolve(scriptDir, '..')
const env = loadEnv('production', clientDir, '')
const siteUrl = (process.env.VITE_SITE_URL || env.VITE_SITE_URL || '').replace(/\/+$/, '')
const template = await readFile(join(distDir, 'index.html'), 'utf8')
const pages = [
  ...publicPagePaths
    .filter((path) => path !== '/')
    .map((path) => ({ path, ...getPageMeta(path) })),
  { path: '/admin', ...getPageMeta('/admin') },
]

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

function escapeText(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function staticRouteContent(path) {
  if (path === '/') {
    return '<main><h1>Stop running channels. Start building a growth engine.</h1><p>Marketplace growth, performance marketing, creative, technology and analytics—connected around your next business priority.</p><p><a href="/solutions">Explore solutions</a> · <a href="/contact">Get My Growth Blueprint</a></p></main>'
  }
  const solution = solutionPages.find((item) => `/solutions/${item.slug}` === path)
  if (solution) {
    return `<main><p>${escapeText(solution.category)}</p><h1>${escapeText(solution.headline)}</h1><p>${escapeText(solution.description)}</p><h2>Practical deliverables</h2><ul>${solution.deliverables.map((item) => `<li>${escapeText(item)}</li>`).join('')}</ul><p><a href="/contact">Discuss this service</a> · <a href="/services">View estimates</a></p></main>`
  }
  const industry = industryPages.find((item) => `/industries/${item.slug}` === path)
  if (industry) {
    return `<main><p>Industries</p><h1>${escapeText(industry.title)}</h1><p>${escapeText(industry.description)}</p><h2>Questions to consider</h2><ul>${industry.considerations.map((item) => `<li>${escapeText(item)}</li>`).join('')}</ul></main>`
  }
  const article = insightArticles.find((item) => `/insights/${item.slug}` === path)
  if (article) {
    return `<main><p>Insights / practical notes</p><h1>${escapeText(article.title)}</h1><p>${escapeText(article.summary)}</p>${article.sections.map(([heading, body]) => `<section><h2>${escapeText(heading)}</h2><p>${escapeText(body)}</p></section>`).join('')}</main>`
  }
  const legal = legalPages[path]
  if (legal) {
    return `<main><h1>${escapeText(legal.title)}</h1><p>${escapeText(legal.description)}</p>${legal.sections.map(([heading, body]) => `<section><h2>${escapeText(heading)}</h2><p>${escapeText(body)}</p></section>`).join('')}</main>`
  }
  const directoryContent = {
    '/solutions': `<main><h1>One growth plan. Joined-up execution.</h1><p>Explore the capabilities behind a connected operating plan.</p><ul>${solutionPages.map((item) => `<li><a href="/solutions/${item.slug}">${escapeText(item.category)}: ${escapeText(item.headline)}</a></li>`).join('')}</ul></main>`,
    '/industries': `<main><h1>Different categories. Thoughtful playbooks.</h1><ul>${industryPages.map((item) => `<li><a href="/industries/${item.slug}">${escapeText(item.title)}</a></li>`).join('')}</ul></main>`,
    '/insights': `<main><h1>Useful questions. Clearer decisions.</h1><ul>${insightArticles.map((item) => `<li><a href="/insights/${item.slug}">${escapeText(item.title)}</a><p>${escapeText(item.summary)}</p></li>`).join('')}</ul></main>`,
    '/work': '<main><h1>The work behind the numbers.</h1><p>Case studies will be published only after evidence and client permissions are confirmed. No client results or logos are invented.</p><a href="/contact">Ask about relevant experience</a></main>',
    '/services': '<main><h1>Services & indicative estimates</h1><p>All prices are in INR. Final pricing depends on scope and requirements. Domain, hosting, paid APIs and third-party licenses are separate.</p></main>',
    '/about': '<main><h1>Built for brands that refuse to stand still.</h1><p>The Sales Knob brings marketplace operations, performance marketing, creative and digital commerce into a coordinated growth partnership.</p></main>',
    '/contact': '<main><h1>Tell us where growth is getting stuck.</h1><p>Share your business context and practical next steps. Do not send passwords or sensitive personal information.</p></main>',
    '/404': '<main><h1>Page not found</h1><p>The requested page could not be found.</p><a href="/">Return home</a></main>',
    '/admin': '<main><h1>Admin</h1><p>Manage service offerings and enquiries.</p></main>',
  }
  return directoryContent[path] || '<main><h1>The Sales Knob</h1><a href="/">Return home</a></main>'
}

function setCanonical(html, path) {
  const href = siteUrl ? `${siteUrl}${path}` : path
  const tag = `<link rel="canonical" href="${escapeAttribute(href)}" />`
  if (/<link rel="canonical"[^>]*\/?>/.test(html)) {
    return html.replace(/<link rel="canonical"[^>]*\/?>/, tag)
  }
  return html.replace('</head>', `    ${tag}\n  </head>`)
}

for (const page of pages) {
  const meta = page.path === '/admin' ? page : getPageMeta(page.path)
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttribute(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeAttribute(meta.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeAttribute(meta.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeAttribute(meta.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeAttribute(siteUrl ? `${siteUrl}${page.path}` : page.path)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeAttribute(meta.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeAttribute(meta.description)}" />`)
  html = html.replace('<div id="root"></div>', `<div id="root">${staticRouteContent(page.path)}</div>`)
  html = setCanonical(html, page.path)
  if (meta.noIndex) html = html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
  const output = join(distDir, page.path.slice(1), 'index.html')
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, html)
}

const home = template
  .replace('<div id="root"></div>', `<div id="root">${staticRouteContent('/')}</div>`)
  .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeAttribute(siteUrl ? `${siteUrl}/` : '/')}" />`)
await writeFile(join(distDir, 'index.html'), setCanonical(home, '/'))

if (siteUrl) {
  const urls = publicPagePaths.filter((path) => path !== '/404')
    .map((path) => `  <url><loc>${escapeAttribute(`${siteUrl}${path}`)}</loc></url>`)
    .join('\n')
  await writeFile(join(distDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  await writeFile(join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`)
} else {
  console.warn('VITE_SITE_URL is not set; absolute sitemap.xml and production canonical URLs were not generated.')
}

console.log(`Created prerendered SEO shells for ${pages.length + 1} routes.`)
