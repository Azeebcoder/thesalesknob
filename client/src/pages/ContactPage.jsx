// Hosts the standalone growth-enquiry form route.
import { ContactSection } from '../components/ContactSection'

// Renders the contact form without the homepage section anchor.
export default function ContactPage() {
  return (
    <div className="figma-page">
      <ContactSection standalone />
    </div>
  )
}
