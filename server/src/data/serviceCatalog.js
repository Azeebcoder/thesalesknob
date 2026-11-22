// Supplies the initial service estimates and ordering used by the seeding script.
const serviceRows = [
  ['Website & Web Application Development', 'Business / Corporate Website', '₹10,000 – ₹20,000'],
  ['Website & Web Application Development', 'Custom Dynamic Website / Web Application', '₹20,000 – ₹45,000'],
  ['Website & Web Application Development', 'Advanced Web Platform', '₹45,000 – ₹1,00,000+'],
  ['Enterprise Software & Management Systems', 'Custom CRM / CMS / HRMS', '₹25,000 – ₹50,000'],
  ['Enterprise Software & Management Systems', 'ERP / Inventory / Billing Systems', '₹35,000 – ₹75,000'],
  ['Enterprise Software & Management Systems', 'Enterprise Portals & Business Automation', '₹50,000 – ₹1,50,000+'],
  ['AI & Intelligent Solutions', 'AI Chatbots & Website Assistants', '₹15,000 – ₹35,000'],
  ['AI & Intelligent Solutions', 'RAG-based AI & Document Q&A Systems', '₹25,000 – ₹60,000'],
  ['AI & Intelligent Solutions', 'AI Agents, Text-to-SQL & Custom AI Integration', '₹35,000 – ₹1,00,000+'],
  ['Mobile Application Development', 'Android / iOS Applications', '₹25,000 – ₹60,000'],
  ['Mobile Application Development', 'Cross-platform Mobile Applications', '₹35,000 – ₹80,000+'],
  ['Data Analytics & Dashboard Development', 'Admin & Analytics Dashboards', '₹15,000 – ₹35,000'],
  ['Data Analytics & Dashboard Development', 'Real-time Data Analytics & Reporting', '₹25,000 – ₹60,000'],
  ['Data Analytics & Dashboard Development', 'Advanced Enterprise Analytics Platforms', '₹50,000 – ₹1,00,000+'],
  ['E-commerce Development', 'Shopify Store Development & Customization', '₹8,000 – ₹20,000'],
  ['E-commerce Development', 'Custom Shopify Theme & App Development', '₹15,000 – ₹50,000+'],
  ['E-commerce Development', 'WordPress Website & Custom Theme Development', '₹10,000 – ₹25,000'],
  ['E-commerce Development', 'Custom WordPress Plugin Development', '₹5,000 – ₹25,000+'],
  ['UI/UX Design & Figma Prototyping', 'Website & Application UI/UX Design', '₹5,000 – ₹15,000'],
  ['UI/UX Design & Figma Prototyping', 'Complete UI Design & Interactive Prototyping', '₹10,000 – ₹25,000'],
  ['Cloud Infrastructure & DevOps Management', 'AWS / DigitalOcean / VPS Setup', '₹3,000 – ₹8,000'],
  ['Cloud Infrastructure & DevOps Management', 'Server Migration, Deployment & Configuration', '₹5,000 – ₹12,000'],
  ['Cloud Infrastructure & DevOps Management', 'Security, Optimization & Infrastructure Management', '₹5,000 – ₹10,000/month'],
  ['Cybersecurity & Penetration Testing', 'Website Security Audit', '₹5,000 – ₹10,000'],
  ['Cybersecurity & Penetration Testing', 'Web Application Penetration Testing', '₹10,000 – ₹25,000'],
  ['Cybersecurity & Penetration Testing', 'Advanced Security Assessment & Hardening', '₹25,000 – ₹50,000+'],
  ['Social Media & Digital Marketing', 'Social Media Management', '₹5,000 – ₹15,000/month'],
  ['Social Media & Digital Marketing', 'Content & Marketing Campaign Management', '₹15,000 – ₹25,000/month'],
]

const categoryOrder = new Map(
  [...new Set(serviceRows.map(([category]) => category))].map((category, index) => [category, index]),
)

export const initialServices = serviceRows.map(([category, name, priceLabel], sortOrder) => ({
  category,
  name,
  priceLabel,
  categoryOrder: categoryOrder.get(category),
  sortOrder,
}))
