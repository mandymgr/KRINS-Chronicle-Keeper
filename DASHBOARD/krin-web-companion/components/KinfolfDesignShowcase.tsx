/**
 * KINFOLK DESIGN SYSTEM SHOWCASE
 * Complete component examples using the Kinfolk Editorial Design System
 * This file demonstrates all design tokens, typography, and components
 */

import React from 'react';

const KinfolfDesignShowcase: React.FC = () => {
  return (
    <div className="kinfolk-container">
      {/* Import the design system CSS */}
      <style jsx>{`
        @import url('../styles/kinfolk-design-system.css');
      `}</style>

      {/* Header Example */}
      <div className="kinfolk-header">
        <div className="kinfolk-header-content">
          <div className="kinfolk-header-brand">
            <div className="kinfolk-avatar">
              <div className="kinfolk-avatar-image">K</div>
              <div className="kinfolk-avatar-status"></div>
            </div>
            
            <div>
              <h1 className="kinfolk-brand-title">Krin</h1>
              <p className="kinfolk-brand-subtitle">Design System</p>
            </div>
          </div>
          
          <nav className="kinfolk-header-nav">
            <button className="kinfolk-button">Home</button>
            <button className="kinfolk-button">About</button>
            <button className="kinfolk-button">Work</button>
            <button className="kinfolk-button">Contact</button>
          </nav>
        </div>
      </div>

      <div className="kinfolk-content-wrapper">
        
        {/* Typography Showcase */}
        <section className="kinfolk-section-hero">
          <div className="kinfolk-editorial-section">
            <h1 className="kinfolk-heading-display">Design System</h1>
            <div className="kinfolk-editorial-intro">
              <p className="kinfolk-body-large">
                A comprehensive Kinfolk-inspired editorial design system featuring Nordic minimalism, 
                warm typography, and thoughtful spacing for modern digital experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Typography Examples */}
        <section className="kinfolk-section">
          <h2 className="kinfolk-heading-section">Typography Scale</h2>
          
          <div className="kinfolk-grid-2">
            <div className="kinfolk-card">
              <div className="kinfolk-card-header">
                <h3 className="kinfolk-heading-card">Headings</h3>
              </div>
              <div className="kinfolk-card-content">
                <h1 className="kinfolk-heading-display">Display Heading</h1>
                <h2 className="kinfolk-heading-hero">Hero Heading</h2>
                <h3 className="kinfolk-heading-section">Section Heading</h3>
                <h4 className="kinfolk-heading-subsection">Subsection Heading</h4>
                <h5 className="kinfolk-heading-card">Card Heading</h5>
              </div>
            </div>

            <div className="kinfolk-card">
              <div className="kinfolk-card-header">
                <h3 className="kinfolk-heading-card">Body Text</h3>
              </div>
              <div className="kinfolk-card-content">
                <p className="kinfolk-body-large">Large body text with italic styling for emphasis and editorial feel.</p>
                <p className="kinfolk-body-normal">Normal body text for standard content and readable paragraphs.</p>
                <p className="kinfolk-body-small">Small body text for secondary information and captions.</p>
                <p className="kinfolk-nav-primary">Navigation Primary</p>
                <p className="kinfolk-nav-secondary">Navigation Secondary</p>
                <p className="kinfolk-label">Status Label</p>
                <p className="kinfolk-caption">Image caption or fine print text</p>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="kinfolk-section">
          <h2 className="kinfolk-heading-section">Color Palette</h2>
          
          <div className="kinfolk-grid-3">
            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Primary Colors</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-primary)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Primary</div>
                    <div className="kinfolk-caption">#8b7355</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-primary-dark)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Primary Dark</div>
                    <div className="kinfolk-caption">#6b5b4f</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-primary-light)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Primary Light</div>
                    <div className="kinfolk-caption">#a68b73</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Neutrals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-neutral-900)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Neutral 900</div>
                    <div className="kinfolk-caption">#2d2d2d</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-neutral-700)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Neutral 700</div>
                    <div className="kinfolk-caption">#4a4a4a</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-neutral-500)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Neutral 500</div>
                    <div className="kinfolk-caption">#6b5b4f</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Surfaces</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-surface-primary)', border: '1px solid var(--kinfolk-neutral-200)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Primary</div>
                    <div className="kinfolk-caption">#ffffff</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-surface-secondary)', border: '1px solid var(--kinfolk-neutral-200)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Secondary</div>
                    <div className="kinfolk-caption">#fefefe</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--kinfolk-surface-muted)', border: '1px solid var(--kinfolk-neutral-200)', borderRadius: '4px' }}></div>
                  <div>
                    <div className="kinfolk-label">Muted</div>
                    <div className="kinfolk-caption">#f8f6f2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Button Components */}
        <section className="kinfolk-section">
          <h2 className="kinfolk-heading-section">Interactive Elements</h2>
          
          <div className="kinfolk-actions">
            <div className="kinfolk-actions-list">
              <button className="kinfolk-button-primary">Primary Action</button>
              <button className="kinfolk-button-primary">Secondary Action</button>
              <button className="kinfolk-button-primary">Tertiary Action</button>
            </div>
          </div>
          
          <div className="kinfolk-actions">
            <div className="kinfolk-actions-list">
              <button className="kinfolk-button">Navigation Link</button>
              <button className="kinfolk-button">Another Link</button>
              <button className="kinfolk-button">More Links</button>
              <button className="kinfolk-button">Final Link</button>
            </div>
          </div>
        </section>

        {/* Card Layouts */}
        <section className="kinfolk-section">
          <h2 className="kinfolk-heading-section">Card Components</h2>
          
          <div className="kinfolk-grid">
            <div className="kinfolk-card">
              <div className="kinfolk-card-header">
                <h3 className="kinfolk-heading-card">Editorial Card</h3>
              </div>
              <div className="kinfolk-card-content">
                <p className="kinfolk-body-large">
                  This card demonstrates the editorial styling with proper typography hierarchy,
                  spacing, and Nordic-inspired aesthetics.
                </p>
              </div>
              <div className="kinfolk-card-footer">
                <span className="kinfolk-label">Featured</span>
              </div>
            </div>

            <div className="kinfolk-card">
              <div className="kinfolk-card-header">
                <h3 className="kinfolk-heading-card">Content Card</h3>
              </div>
              <div className="kinfolk-card-content">
                <p className="kinfolk-body-normal">
                  Standard content card with normal body text, showcasing the clean and minimal
                  approach to information presentation.
                </p>
              </div>
              <div className="kinfolk-card-footer">
                <span className="kinfolk-label">Published</span>
              </div>
            </div>

            <div className="kinfolk-card">
              <div className="kinfolk-card-header">
                <h3 className="kinfolk-heading-card">Information Card</h3>
              </div>
              <div className="kinfolk-card-content">
                <p className="kinfolk-body-small">
                  Informational card using smaller text for secondary content,
                  maintaining readability while conserving space.
                </p>
              </div>
              <div className="kinfolk-card-footer">
                <span className="kinfolk-label">Archive</span>
              </div>
            </div>
          </div>
        </section>

        {/* Spacing Examples */}
        <section className="kinfolk-section">
          <h2 className="kinfolk-heading-section">Spacing System</h2>
          
          <div className="kinfolk-card">
            <h3 className="kinfolk-heading-card">Editorial Spacing</h3>
            <p className="kinfolk-body-normal" style={{ marginBottom: 'var(--kinfolk-space-8)' }}>
              The spacing system is based on editorial design principles, providing generous white space
              for improved readability and visual hierarchy.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--kinfolk-space-4)' }}>
              <div style={{ padding: 'var(--kinfolk-space-2)', backgroundColor: 'var(--kinfolk-surface-muted)' }}>
                <span className="kinfolk-caption">Space 2 (8px) - Tight spacing</span>
              </div>
              <div style={{ padding: 'var(--kinfolk-space-4)', backgroundColor: 'var(--kinfolk-surface-muted)' }}>
                <span className="kinfolk-caption">Space 4 (16px) - Normal spacing</span>
              </div>
              <div style={{ padding: 'var(--kinfolk-space-8)', backgroundColor: 'var(--kinfolk-surface-muted)' }}>
                <span className="kinfolk-caption">Space 8 (32px) - Generous spacing</span>
              </div>
              <div style={{ padding: 'var(--kinfolk-space-16)', backgroundColor: 'var(--kinfolk-surface-muted)' }}>
                <span className="kinfolk-caption">Space 16 (64px) - Editorial spacing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="kinfolk-section">
          <div className="kinfolk-editorial-section">
            <h2 className="kinfolk-heading-hero">Design Principles</h2>
            <div className="kinfolk-editorial-intro">
              <p className="kinfolk-body-large">
                This design system embodies Nordic minimalism through thoughtful typography,
                warm natural colors, and abundant white space to create serene digital experiences.
              </p>
            </div>
          </div>
          
          <div className="kinfolk-grid-2">
            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Typography</h3>
              <p className="kinfolk-body-normal">
                Georgia serif provides editorial elegance with excellent readability.
                Generous letter-spacing and line-height enhance the reading experience.
              </p>
            </div>

            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Color Philosophy</h3>
              <p className="kinfolk-body-normal">
                Warm earth tones inspired by Nordic nature create a calming, 
                sophisticated palette that works beautifully in any context.
              </p>
            </div>

            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Spacing Approach</h3>
              <p className="kinfolk-body-normal">
                Editorial spacing principles with generous white space allow content
                to breathe and create visual hierarchy naturally.
              </p>
            </div>

            <div className="kinfolk-card">
              <h3 className="kinfolk-heading-card">Component Design</h3>
              <p className="kinfolk-body-normal">
                Clean, minimal components with subtle borders and no rounded corners
                maintain the editorial aesthetic throughout the interface.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default KinfolfDesignShowcase;