// KRINS Developer Hub - Workflow Page

// React import not needed for JSX in modern setup
import { PageHero, ContentSection } from '@/components/shared/Layout'
import { HubNavigation } from '../components/HubNavigation'

export default function Workflow() {
  return (
    <>
      <HubNavigation />
      
      <PageHero 
        subtitle="Development Workflow"
        title="Process & Automation"
        description="KRINS-WORKFLOW.md integration and process automation."
      />

      <ContentSection title="Coming Soon">
        <div style={{ textAlign: 'center', padding: 'var(--space-4xl)', color: 'var(--color-secondary)' }}>
          <p>Workflow automation and KRINS-WORKFLOW.md integration.</p>
        </div>
      </ContentSection>
    </>
  )
}