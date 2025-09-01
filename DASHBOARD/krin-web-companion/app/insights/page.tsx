'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function InsightsPage() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#2f2e2e',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px 0',
        borderBottom: 'none'
      }}>
        <div style={{ 
          maxWidth: '880px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          {/* Brand Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 style={{
                fontSize: '15px',
                fontFamily: "'Playfair Display', serif",
                fontWeight: '700',
                marginBottom: '5px',
                color: '#2f2e2e',
                textTransform: 'uppercase',
                letterSpacing: '2px'
              }}>
                KRIN
              </h1>
            </Link>
            <p style={{
              fontSize: '14px',
              color: '#2f2e2e',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0'
            }}>
              Analytics & Insights
            </p>
          </div>
          
          {/* Navigation */}
          <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            <Link href="/memory" style={{
              padding: '10px 15px',
              color: '#2f2e2e',
              fontSize: '16px',
              textDecoration: 'none',
              backgroundColor: hoveredButton === 'memory' ? '#ddd' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredButton('memory')}
            onMouseLeave={() => setHoveredButton(null)}
            >
              Memory
            </Link>
            <Link href="/projects" style={{
              padding: '10px 15px',
              color: '#2f2e2e',
              fontSize: '16px',
              textDecoration: 'none',
              backgroundColor: hoveredButton === 'projects' ? '#ddd' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredButton('projects')}
            onMouseLeave={() => setHoveredButton(null)}
            >
              Projects
            </Link>
            <Link href="/insights" style={{
              padding: '10px 15px',
              color: '#2f2e2e',
              fontSize: '16px',
              textDecoration: 'none',
              backgroundColor: '#ddd',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}>
              Insights
            </Link>
            <Link href="/settings" style={{
              padding: '10px 15px',
              color: '#2f2e2e',
              fontSize: '16px',
              textDecoration: 'none',
              backgroundColor: hoveredButton === 'settings' ? '#ddd' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredButton('settings')}
            onMouseLeave={() => setHoveredButton(null)}
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '880px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontFamily: "'Playfair Display', serif",
            fontWeight: '400',
            marginBottom: '20px',
            color: '#2f2e2e',
            lineHeight: '1.3'
          }}>
            System Insights
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#2f2e2e',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Performance analytics, usage patterns, and strategic insights from our 
            collaborative AI systems and dashboard implementations.
          </p>
        </div>

        {/* Insights Categories */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '60px'
        }}>
          
          {/* Performance Metrics */}
          <div>
            <h3 style={{
              fontSize: '15px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '700',
              marginBottom: '30px',
              color: '#2f2e2e',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center'
            }}>
              Performance Metrics
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2f2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Development Velocity
                </h4>
                <div style={{
                  fontSize: '24px',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '400',
                  color: '#2f2e2e',
                  marginBottom: '10px'
                }}>
                  98%
                </div>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>
                  Project completion rate with zero critical issues. 
                  Seamless AI coordination achieving optimal efficiency.
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2f2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  System Reliability
                </h4>
                <div style={{
                  fontSize: '24px',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '400',
                  color: '#2f2e2e',
                  marginBottom: '10px'
                }}>
                  99.9%
                </div>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>
                  Uptime across all AI agents and dashboard components. 
                  Consistent performance with automated error recovery.
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2f2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Design Coherence
                </h4>
                <div style={{
                  fontSize: '24px',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '400',
                  color: '#2f2e2e',
                  marginBottom: '10px'
                }}>
                  100%
                </div>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>
                  Design system adherence across all interfaces. 
                  Perfect Nordic aesthetic implementation throughout.
                </p>
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div>
            <h3 style={{
              fontSize: '15px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '700',
              marginBottom: '30px',
              color: '#2f2e2e',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center'
            }}>
              Usage Analytics
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2f2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Most Active Feature
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '10px',
                  lineHeight: '1.6',
                  fontWeight: '700'
                }}>
                  Living Spec Dashboard
                </p>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>
                  Primary interface for project coordination and AI system management. 
                  Highest engagement and user satisfaction scores.
                </p>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '700',
                  marginBottom: '15px',
                  color: '#2f2e2e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Response Time
                </h4>
                <div style={{
                  fontSize: '18px',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '400',
                  color: '#2f2e2e',
                  marginBottom: '10px'
                }}>
                  &lt; 200ms
                </div>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '0',
                  lineHeight: '1.6'
                }}>
                  Average response time across all system components. 
                  Optimized performance ensuring smooth user experience.
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Insights */}
          <div>
            <h3 style={{
              fontSize: '15px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '700',
              marginBottom: '30px',
              color: '#2f2e2e',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              textAlign: 'center'
            }}>
              Strategic Insights
            </h3>
            
            <div style={{
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#2f2e2e',
                lineHeight: '1.6',
                marginBottom: '40px'
              }}>
                The Nordic design approach has proven highly effective for our AI-driven interfaces. 
                Clean typography and generous spacing enhance both usability and aesthetic appeal. 
                Future development should maintain this design philosophy while expanding functionality.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#2f2e2e',
                  border: '1px solid #000000',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}>
                  Export Data
                </button>
                <button style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#2f2e2e',
                  border: '1px solid #000000',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Back Navigation */}
          <div style={{
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <Link href="/" style={{
              padding: '12px 30px',
              backgroundColor: '#2d348b',
              color: '#ffffff',
              border: '1px solid #000000',
              fontSize: '14px',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              fontWeight: '400'
            }}>
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}