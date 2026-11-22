// Defines the application routes, shared layout, and page-loading fallbacks.
import { Suspense, lazy } from 'react'
import { MotionConfig } from 'framer-motion'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Seo } from './components/Seo'
import { SiteLayout } from './components/SiteLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const SolutionsIndexPage = lazy(() => import('./pages/SolutionsPage').then(({ SolutionsIndexPage: Page }) => ({ default: Page })))
const SolutionDetailPage = lazy(() => import('./pages/SolutionsPage'))
const IndustriesPage = lazy(() => import('./pages/IndustriesPage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))

// Shows a status message while a route is being loaded.
function PageLoader() {
  return <div className="page-loader" role="status">Loading page…</div>
}

// Presents the not-found page for the explicit 404 route.
function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>This path needs<br /><em>a new direction.</em></h1>
      <a className="button button-lime" href="/">Back to home</a>
    </section>
  )
}

// Composes route-level providers and connects URL paths to page components.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Seo />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="solutions" element={<SolutionsIndexPage />} />
            <Route path="solutions/:slug" element={<SolutionDetailPage />} />
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="industries/:slug" element={<IndustriesPage />} />
            <Route path="work" element={<WorkPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="insights/:slug" element={<InsightsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<LegalPage />} />
            <Route path="terms" element={<LegalPage />} />
            <Route path="cookies" element={<LegalPage />} />
          </Route>
          <Route path="admin" element={<AdminPage />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  )
}
