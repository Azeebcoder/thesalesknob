// Defines static solution, industry, insight, legal, and SEO page content.
const commonFaqs = [
  {
    question: 'How is the engagement scoped?',
    answer: 'We review your goals, current setup, access requirements and constraints before agreeing on deliverables, timing and fees.',
  },
  {
    question: 'Are results guaranteed?',
    answer: 'No. Outcomes depend on your offer, market, competition, budget and execution. We agree on measurable work and review progress without promising a fixed return.',
  },
]

export const solutionPages = [
  {
    slug: 'marketplace-growth',
    category: 'Marketplace Growth',
    headline: 'From first listing to a stronger marketplace operation.',
    description: 'Coordinate catalog foundations, content, promotions, marketplace advertising and reporting across the channels that fit your business.',
    audience: 'Brands preparing to launch, improve or expand marketplace operations.',
    challenges: ['Incomplete catalog and listing foundations', 'Disconnected content, promotions and advertising', 'Unclear ownership of marketplace priorities'],
    deliverables: ['Marketplace and catalog audit', 'Listing SEO, content and storefront recommendations', 'Account-health, promotion and advertising priorities', 'A practical reporting and review cadence'],
    channels: ['Amazon', 'Walmart', 'Flipkart', 'Myntra & AJIO', 'Quick commerce'],
    faqs: commonFaqs,
  },
  {
    slug: 'amazon-management',
    category: 'Marketplace Growth',
    headline: 'Make Amazon work harder for your brand.',
    description: 'From catalog foundations and A+ content to campaign management and growth reporting, turn marketplace complexity into a clear operating plan.',
    audience: 'Amazon sellers who need stronger catalog, content, advertising or account operations.',
    challenges: ['Catalog gaps and inconsistent product detail pages', 'Uncoordinated advertising and listing changes', 'Limited visibility into account health and priorities'],
    deliverables: ['Catalog and account review', 'Listing SEO and A+ content planning', 'Store, promotion and advertising recommendations', 'Ongoing performance and account-health reporting'],
    channels: ['Amazon India', 'Amazon USA'],
    cta: 'Request Amazon Account Audit',
    faqs: commonFaqs,
  },
  {
    slug: 'walmart-usa',
    category: 'Marketplace Growth',
    headline: 'Build a stronger business on Walmart Marketplace.',
    description: 'Plan US marketplace expansion across listings, operations, promotions and measurement—not onboarding alone.',
    audience: 'Brands evaluating or operating on Walmart Marketplace in the United States.',
    challenges: ['Unclear readiness and catalog requirements', 'Marketplace operations that are not connected to the wider plan', 'Promotions and measurement without agreed priorities'],
    deliverables: ['Marketplace readiness and catalog review', 'Listing and operational recommendations', 'Promotion and growth planning', 'Measurement and next-step roadmap'],
    channels: ['Walmart Marketplace USA'],
    cta: 'Plan My Walmart Expansion',
    faqs: commonFaqs,
  },
  {
    slug: 'flipkart',
    category: 'Marketplace Growth',
    headline: 'Build a clearer operating plan for Flipkart.',
    description: 'Connect catalog quality, promotions, marketplace advertising and account operations around your business priorities.',
    audience: 'Brands and sellers seeking a more coordinated Flipkart operation.',
    challenges: ['Catalog quality and discoverability gaps', 'Promotions disconnected from inventory and campaign plans', 'Reporting that does not guide the next action'],
    deliverables: ['Catalog and listing review', 'Content and discoverability recommendations', 'Promotion and advertising priorities', 'A review cadence for operational issues and performance'],
    channels: ['Flipkart'],
    faqs: commonFaqs,
  },
  {
    slug: 'myntra-ajio',
    category: 'Marketplace Growth',
    headline: 'Bring fashion marketplace operations into focus.',
    description: 'Coordinate product presentation, catalog readiness and marketplace priorities for fashion and lifestyle channels.',
    audience: 'Fashion and lifestyle brands planning or improving marketplace operations.',
    challenges: ['Product content that does not reflect the assortment', 'Launch and promotion tasks spread across teams', 'Limited visibility into operational priorities'],
    deliverables: ['Assortment and catalog review', 'Product-page content recommendations', 'Launch, promotion and operational planning', 'Measurement priorities for the next review'],
    channels: ['Myntra', 'AJIO'],
    faqs: commonFaqs,
  },
  {
    slug: 'quick-commerce',
    category: 'Marketplace Growth',
    headline: 'Plan a more connected quick-commerce presence.',
    description: 'Bring assortment, product information, availability and promotions into one practical operating view.',
    audience: 'Consumer brands assessing quick-commerce channels and operating requirements.',
    challenges: ['Assortments that vary by platform or market', 'Product information and availability managed in silos', 'Promotional activity without a shared review plan'],
    deliverables: ['Channel and assortment planning', 'Product-content readiness checklist', 'Availability and promotion coordination', 'Reporting questions and operating cadence'],
    channels: ['Quick-commerce marketplaces'],
    faqs: commonFaqs,
  },
  {
    slug: 'performance-marketing',
    category: 'Performance Marketing',
    headline: 'Paid media with a business case behind every click.',
    description: 'Align creative, audience, landing pages and measurement before scaling media activity.',
    audience: 'Teams who want clearer campaign structure, testing priorities and reporting.',
    challenges: ['Campaigns optimized to disconnected metrics', 'Creative tests without a useful learning plan', 'Landing pages and tracking that do not support decisions'],
    deliverables: ['Account and tracking review', 'Campaign structure and audience recommendations', 'Creative and testing plan', 'Optimization priorities and reporting'],
    channels: ['Meta Ads', 'Google Ads', 'Retargeting', 'Lead generation'],
    faqs: commonFaqs,
  },
  {
    slug: 'meta-ads',
    category: 'Performance Marketing',
    headline: 'Make Meta campaigns easier to learn from.',
    description: 'Connect campaign structure, audience strategy, creative testing and landing-page experience to your business goals.',
    audience: 'Brands running or preparing to run Meta advertising.',
    challenges: ['Creative fatigue without a repeatable test plan', 'Audience and campaign structures that are hard to interpret', 'Conversion signals that are not reviewed with context'],
    deliverables: ['Meta account and event review', 'Campaign and audience recommendations', 'Creative test matrix', 'Optimization and reporting cadence'],
    channels: ['Facebook', 'Instagram', 'Meta Ads'],
    faqs: commonFaqs,
  },
  {
    slug: 'google-ads',
    category: 'Performance Marketing',
    headline: 'Give every Google Ads decision more context.',
    description: 'Coordinate search, shopping, retargeting and measurement with the offer and customer journey.',
    audience: 'Businesses looking to organize Google Ads activity around useful conversion signals.',
    challenges: ['Search intent and landing pages that do not align', 'Shopping feeds or campaign structures needing review', 'Optimization decisions made without clear measurement'],
    deliverables: ['Account, conversion and feed review', 'Search and shopping structure recommendations', 'Landing-page and test priorities', 'Ongoing optimization and reporting plan'],
    channels: ['Google Search', 'Google Shopping', 'Retargeting'],
    faqs: commonFaqs,
  },
  {
    slug: 'ecommerce-development',
    category: 'E-commerce & Web',
    headline: 'A storefront designed to turn attention into action.',
    description: 'Improve the path from product discovery to purchase with considered commerce design, development and measurement.',
    audience: 'Retail and direct-to-consumer teams improving a storefront or planning a new commerce experience.',
    challenges: ['Product discovery and navigation friction', 'Inconsistent desktop and mobile journeys', 'Storefront changes without a measurement plan'],
    deliverables: ['Storefront and customer-journey review', 'Information architecture and UI recommendations', 'Commerce implementation or enhancement plan', 'Conversion and analytics checks'],
    channels: ['Shopify', 'WordPress', 'Custom commerce'],
    faqs: commonFaqs,
  },
  {
    slug: 'web-development',
    category: 'E-commerce & Web',
    headline: 'Build the right digital experience, well.',
    description: 'Plan and build business websites, applications and landing pages around the people who need to use them.',
    audience: 'Teams that need a new website, application or focused landing-page experience.',
    challenges: ['Unclear requirements and competing stakeholder needs', 'Slow or inconsistent journeys across screen sizes', 'Technology decisions made before the user journey is clear'],
    deliverables: ['Requirements and information architecture', 'Responsive UI and implementation', 'Integration and accessibility checks', 'Launch, analytics and maintenance handover'],
    channels: ['React', 'Node.js', 'Shopify', 'WordPress'],
    faqs: commonFaqs,
  },
  {
    slug: 'creative-content',
    category: 'Creative & Content',
    headline: 'Make every impression work harder.',
    description: 'Develop brand-aligned creative systems for campaigns, product listings, storefronts and motion.',
    audience: 'Teams that need consistent creative concepts and assets across customer touchpoints.',
    challenges: ['Creative that varies across channels and formats', 'Product content without a clear hierarchy', 'Campaign assets made without a testing question'],
    deliverables: ['Creative and channel audit', 'Brand-aligned concepts and asset direction', 'Listing, campaign and motion formats', 'A practical versioning and testing plan'],
    channels: ['Product listings', 'Amazon A+', 'Social', 'Video'],
    faqs: commonFaqs,
  },
  {
    slug: 'seo',
    category: 'Organic Visibility',
    headline: 'Get discovered where purchase intent begins.',
    description: 'Improve technical foundations, useful content and discoverability across search and marketplaces.',
    audience: 'Brands that want a clearer, maintainable approach to organic search visibility.',
    challenges: ['Technical issues that make important content harder to find', 'Content plans without a clear search purpose', 'Marketplace and website discovery managed separately'],
    deliverables: ['Technical and content audit', 'Keyword and information-architecture recommendations', 'On-page and internal-link priorities', 'Measurement and review plan'],
    channels: ['Technical SEO', 'Content', 'Marketplace search'],
    faqs: commonFaqs,
  },
  {
    slug: 'growth-intelligence',
    category: 'Growth Intelligence',
    headline: 'Connect the data. Find the opportunity.',
    description: 'Turn channel data into useful priorities, clearer reporting and considered expansion plans.',
    audience: 'Leaders who need a reliable view of performance, constraints and next actions.',
    challenges: ['Reports that present activity without decisions', 'KPIs defined differently across channels', 'Planning that overlooks margin, stock or measurement constraints'],
    deliverables: ['Growth and measurement audit', 'KPI definitions and reporting structure', 'Forecasting scenarios and constraints review', 'Prioritized action plan and review cadence'],
    channels: ['Revenue', 'Margin', 'CAC', 'ACOS', 'ROAS', 'Stock'],
    faqs: commonFaqs,
  },
  {
    slug: 'enterprise-systems',
    category: 'Enterprise Software',
    headline: 'Connect the systems behind the day-to-day work.',
    description: 'Scope CRM, CMS, HRMS, ERP, inventory, billing and workflow automation around real operating needs.',
    audience: 'Organizations evaluating a custom platform, system integration or internal workflow improvement.',
    challenges: ['Manual handoffs and duplicated data', 'Tools that do not reflect current processes', 'Large requirements without clear delivery priorities'],
    deliverables: ['Process and requirements discovery', 'System architecture and integration plan', 'Phased implementation and testing', 'Documentation and operational handover'],
    channels: ['CRM', 'CMS', 'HRMS', 'ERP', 'Inventory', 'Billing'],
    faqs: commonFaqs,
  },
  {
    slug: 'ai-solutions',
    category: 'AI & Intelligent Solutions',
    headline: 'Apply AI where it improves a real workflow.',
    description: 'Explore assistants, retrieval-augmented generation, agents and data tools with clear human oversight and evaluation.',
    audience: 'Teams with a defined knowledge or workflow problem to assess for AI assistance.',
    challenges: ['Unstructured information that is difficult to retrieve', 'Automation ideas without evaluation criteria', 'Unclear data, privacy or human-review boundaries'],
    deliverables: ['Use-case and data-readiness review', 'Prototype and evaluation criteria', 'Integration and human-review design', 'Monitoring, documentation and handover plan'],
    channels: ['RAG', 'LLM integrations', 'Vector databases', 'Text-to-SQL'],
    faqs: commonFaqs,
  },
  {
    slug: 'mobile-app-development',
    category: 'Mobile Applications',
    headline: 'Design mobile experiences around real tasks.',
    description: 'Plan and build Android, iOS or cross-platform applications with clear user flows and operational requirements.',
    audience: 'Teams validating or developing a mobile product or internal application.',
    challenges: ['Feature lists without prioritized user journeys', 'Platform decisions made before requirements are understood', 'Launch plans without support and maintenance considerations'],
    deliverables: ['Product and platform discovery', 'User flows and responsive interface design', 'Application development and integration', 'Testing, release and maintenance handover'],
    channels: ['Android', 'iOS', 'Flutter', 'React Native'],
    faqs: commonFaqs,
  },
  {
    slug: 'analytics-dashboards',
    category: 'Data Analytics',
    headline: 'Make important operating signals easier to use.',
    description: 'Define useful metrics and build dashboards that help teams understand what changed and what to review next.',
    audience: 'Teams consolidating reporting or planning an analytics dashboard.',
    challenges: ['Manual reporting and inconsistent definitions', 'Charts without context or ownership', 'Data sources that need validation before combining'],
    deliverables: ['Source and metric audit', 'KPI definitions and dashboard structure', 'Data integration and visualization plan', 'Validation and maintenance guidance'],
    channels: ['Business dashboards', 'Real-time reporting', 'Analytics'],
    faqs: commonFaqs,
  },
  {
    slug: 'ui-ux-design',
    category: 'UI/UX Design',
    headline: 'Make the next interaction feel clear.',
    description: 'Turn requirements into information architecture, interface systems and prototypes that are ready to validate.',
    audience: 'Teams shaping a digital product, website or internal tool before development.',
    challenges: ['Unvalidated flows and competing page priorities', 'Inconsistent patterns across screens', 'Design handoff details missing for implementation'],
    deliverables: ['Discovery and user-flow mapping', 'Wireframes and interface design', 'Reusable component and interaction states', 'Figma prototype and implementation handoff'],
    channels: ['Figma', 'Prototyping', 'Design systems'],
    faqs: commonFaqs,
  },
  {
    slug: 'cloud-devops',
    category: 'Cloud & DevOps',
    headline: 'Build an infrastructure plan your team can operate.',
    description: 'Plan cloud and server setup, deployment, monitoring, backups and infrastructure improvements around your application.',
    audience: 'Teams deploying, migrating or improving the operation of an application or website.',
    challenges: ['Manual deployment and unclear rollback steps', 'Infrastructure settings without documentation', 'Monitoring and backup responsibilities that are undefined'],
    deliverables: ['Infrastructure and deployment review', 'Migration or setup plan', 'CI/CD, monitoring and backup recommendations', 'Operational documentation and handover'],
    channels: ['AWS', 'DigitalOcean', 'Linux', 'Nginx'],
    faqs: commonFaqs,
  },
  {
    slug: 'cybersecurity',
    category: 'Cybersecurity',
    headline: 'Understand the security work before it begins.',
    description: 'Scope an authorized security review, document findings and prioritize practical remediation with the system owner.',
    audience: 'Owners who can authorize a defined assessment of their own website or application.',
    challenges: ['Unclear assessment scope and authorization', 'Security findings without actionable prioritization', 'Remediation work without a verification plan'],
    deliverables: ['Written scope and authorization checklist', 'Defined assessment and test window', 'Findings with impact and remediation context', 'Retest plan after approved fixes'],
    channels: ['Authorized audits', 'Application security', 'Hardening'],
    faqs: [
      ...commonFaqs,
      {
        question: 'How is testing authorized?',
        answer: 'Testing begins only after the system owner approves the exact assets, methods and time window in writing. Third-party systems are excluded unless separately authorized.',
      },
    ],
  },
  {
    slug: 'social-media',
    category: 'Creative & Content',
    headline: 'Give social activity a clear role in the growth plan.',
    description: 'Plan content and campaign operations around your audience, brand voice, available assets and wider commercial priorities.',
    audience: 'Teams seeking a more consistent social publishing and campaign process.',
    challenges: ['Publishing without a defined audience or purpose', 'Inconsistent creative and review workflows', 'Activity reporting disconnected from business goals'],
    deliverables: ['Channel and content review', 'Editorial themes and campaign planning', 'Creative production and approval workflow', 'Publishing and reporting cadence'],
    channels: ['Social media', 'Content', 'Campaigns'],
    faqs: commonFaqs,
  },
]

export const industryPages = [
  {
    slug: 'fashion',
    title: 'Fashion & Apparel',
    description: 'Coordinate assortment, product presentation, channel operations and campaign priorities for fashion and apparel teams.',
    considerations: ['Seasonal assortment and launch planning', 'Consistent product information and imagery', 'Marketplace and storefront merchandising'],
    related: ['marketplace-growth', 'creative-content', 'performance-marketing'],
  },
  {
    slug: 'beauty',
    title: 'Beauty & Personal Care',
    description: 'Connect product education, listing quality, creative and channel operations for beauty and personal-care brands.',
    considerations: ['Clear product benefits and compliant content', 'Consistent presentation across product variants', 'Campaign and marketplace coordination'],
    related: ['amazon-management', 'creative-content', 'growth-intelligence'],
  },
  {
    slug: 'fmcg',
    title: 'FMCG & Consumer Goods',
    description: 'Plan catalog, availability, promotional and reporting workflows for fast-moving consumer brands.',
    considerations: ['Assortment and availability across channels', 'Retail and marketplace promotion coordination', 'Useful reporting across product groups'],
    related: ['marketplace-growth', 'quick-commerce', 'analytics-dashboards'],
  },
  {
    slug: 'home-living',
    title: 'Home & Living',
    description: 'Support considered product discovery, detailed content and commerce experiences for home and lifestyle brands.',
    considerations: ['Product detail and use-case education', 'Navigation across broad assortments', 'Consistent imagery and storefront journeys'],
    related: ['ecommerce-development', 'creative-content', 'seo'],
  },
]

export const insightArticles = [
  {
    slug: 'choose-the-next-growth-bottleneck',
    title: 'How to choose the next growth bottleneck to solve',
    summary: 'A practical way to separate symptoms from the constraint that should guide the next test.',
    sections: [
      ['Start with the customer journey', 'Map how a customer discovers the offer, evaluates it, completes an order and receives support. Record the evidence available at each step.'],
      ['Name the constraint, not just the metric', 'A change in a metric is a signal to investigate. Check the offer, inventory, tracking, customer experience and channel context before choosing an intervention.'],
      ['Agree on one review question', 'Define the action, owner, measurement window and decision that will follow. This makes the next review useful even when the outcome is inconclusive.'],
    ],
  },
  {
    slug: 'marketplace-expansion-readiness',
    title: 'A readiness checklist for marketplace expansion',
    summary: 'Review catalog, operations, content and measurement before adding another marketplace.',
    sections: [
      ['Confirm the operating basics', 'Check product data, imagery, inventory ownership, fulfillment requirements and customer-support responsibilities for the target channel.'],
      ['Plan the content and promotion work', 'Document what must change for the new channel, who approves it and how launch activity will be coordinated with existing offers.'],
      ['Set a learning plan', 'Choose the questions the first review should answer, the data required and the conditions that would change the next step.'],
    ],
  },
  {
    slug: 'useful-performance-marketing-review',
    title: 'What belongs in a useful performance marketing review?',
    summary: 'Bring creative, audience, landing pages, measurement and commercial context into the same conversation.',
    sections: [
      ['Check measurement first', 'Review the events and conversion definitions before comparing campaigns. Note gaps, attribution limits and any recent tracking changes.'],
      ['Connect the parts of the journey', 'Read creative, audience, landing-page experience and offer together instead of treating media delivery as the only input.'],
      ['Turn the review into a test', 'Write down the hypothesis, change, audience, review window and decision rule so the team can learn from the result.'],
    ],
  },
]

export const legalPages = {
  '/privacy': {
    title: 'Privacy notice',
    description: 'A draft overview of enquiry information handled by The Sales Knob. Confirm the final legal entity, retention periods and contact details before launch.',
    sections: [
      ['Information you provide', 'The enquiry form may collect your name, work email, company, phone number, website, target market, platforms, business challenge, budget range and consent choice.'],
      ['Why it is used', 'Enquiry details are used to review and respond to your request and to manage the resulting business conversation. Do not send passwords, payment-card details or sensitive personal information.'],
      ['Campaign attribution and analytics', 'If enabled, campaign parameters may be retained for the session to understand which campaign led to an enquiry. Optional analytics tools are not loaded until you give analytics consent.'],
      ['Storage, access and retention', 'Enquiries are stored in the website database and are available to authorized administrators. The data controller identity, retention period, hosting region and request process must be confirmed by the site owner before launch.'],
      ['Your choices', 'You can decline optional analytics using the consent controls. Add the verified privacy contact and legally required data-subject request process before this notice is published as final.'],
    ],
  },
  '/terms': {
    title: 'Terms of use',
    description: 'Draft terms for using this website. The final business terms and governing law require owner and legal review.',
    sections: [
      ['Website information', 'Website descriptions and service estimates are informational. Final scope, deliverables, fees, timing and responsibilities must be agreed in a written engagement.'],
      ['No guaranteed outcomes', 'Business outcomes vary with market conditions, offer, budget, inventory, implementation and other factors. No fixed return or performance result is promised by this website.'],
      ['Permitted use', 'Use the website lawfully and do not attempt to disrupt its operation or access systems without authorization. Security testing is performed only under written authorization and a defined scope.'],
      ['Final review required', 'The owner must add the legal business identity, governing law, liability terms, intellectual-property terms and verified contact route before these terms are treated as final.'],
    ],
  },
  '/cookies': {
    title: 'Cookie & analytics choices',
    description: 'Understand necessary site storage and manage optional analytics consent.',
    sections: [
      ['Necessary storage', 'A small local storage entry remembers your analytics choice. It does not contain your enquiry details.'],
      ['Optional analytics', 'Analytics scripts are loaded only after you opt in and only when a public analytics container ID has been configured for the deployment.'],
      ['Change your choice', 'Use “Privacy settings” in the footer to accept or reject optional analytics again. You can also clear the site’s local storage in your browser.'],
    ],
  },
}

const fixedMeta = {
  '/': { title: 'The Sales Knob — Build a connected growth engine', description: 'Marketplace growth, performance marketing, creative and technology for brands ready to move forward.' },
  '/services': { title: 'Services & estimates — The Sales Knob', description: 'Explore digital, commerce and growth services with indicative INR estimates. Scope and requirements determine final pricing.' },
  '/solutions': { title: 'Growth solutions — The Sales Knob', description: 'Explore marketplace, performance, e-commerce, creative, organic visibility and growth intelligence services.' },
  '/industries': { title: 'Industries — The Sales Knob', description: 'Explore practical growth considerations for fashion, beauty, consumer goods, and home and lifestyle brands.' },
  '/work': { title: 'Our work — The Sales Knob', description: 'A transparent view of the work and evidence required for useful, approved case studies.' },
  '/insights': { title: 'Insights — The Sales Knob', description: 'Practical notes on marketplace operations, performance marketing and connected growth planning.' },
  '/about': { title: 'About — The Sales Knob', description: 'Meet the connected operating approach behind The Sales Knob’s growth, technology and digital services.' },
  '/contact': { title: 'Contact — The Sales Knob', description: 'Tell us where growth is getting stuck and start a practical conversation.' },
  '/privacy': { title: 'Privacy notice — The Sales Knob', description: legalPages['/privacy'].description },
  '/terms': { title: 'Terms of use — The Sales Knob', description: legalPages['/terms'].description },
  '/cookies': { title: 'Cookie choices — The Sales Knob', description: legalPages['/cookies'].description },
  '/admin': { title: 'Admin — The Sales Knob', description: 'Manage service offerings and indicative prices.', noIndex: true },
}

export const publicPagePaths = [
  ...Object.keys(fixedMeta).filter((path) => path !== '/admin'),
  ...solutionPages.map(({ slug }) => `/solutions/${slug}`),
  ...industryPages.map(({ slug }) => `/industries/${slug}`),
  ...insightArticles.map(({ slug }) => `/insights/${slug}`),
  '/404',
]

// Resolves route metadata from the static page catalog with a safe fallback.
export function getPageMeta(pathname) {
  if (fixedMeta[pathname]) return fixedMeta[pathname]
  const solution = pathname.startsWith('/solutions/')
    ? solutionPages.find(({ slug }) => `/solutions/${slug}` === pathname)
    : undefined
  if (solution) return {
    title: `${solution.category}: ${solution.slug === 'amazon-management' ? 'Amazon management' : solution.headline.replace(/\.$/, '')} — The Sales Knob`,
    description: solution.description,
  }
  const industry = pathname.startsWith('/industries/')
    ? industryPages.find(({ slug }) => `/industries/${slug}` === pathname)
    : undefined
  if (industry) return { title: `${industry.title} — The Sales Knob`, description: industry.description }
  const article = pathname.startsWith('/insights/')
    ? insightArticles.find(({ slug }) => `/insights/${slug}` === pathname)
    : undefined
  if (article) return { title: `${article.title} — The Sales Knob`, description: article.summary }
  return { title: 'Page not found — The Sales Knob', description: 'The requested page could not be found.', noIndex: true }
}
