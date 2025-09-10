// KRINS Developer Hub - Insights Page

// React import not needed for JSX in modern setup
import { PageHero, ContentSection } from '@/components/shared/Layout'
import { HubNavigation } from '../components/HubNavigation'

export default function Insights() {
  return (
    <>
      <HubNavigation />
      
      <PageHero 
        subtitle="Development Insights"
        title="Velocity & Quality Metrics"
        description="Development velocity, quality trends, and optimization insights."
      />

      <ContentSection title="Coming Soon">
        <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--color-secondary)' }}>
          <p>Development insights and quality metrics dashboard.</p>
        </div>
      </ContentSection>
    </>
  )
}