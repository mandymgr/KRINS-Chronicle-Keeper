'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProjectsPage() {
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
              Project Management
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
              backgroundColor: '#ddd',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}>
              Projects
            </Link>
            <Link href="/insights" style={{
              padding: '10px 15px',
              color: '#2f2e2e',
              fontSize: '16px',
              textDecoration: 'none',
              backgroundColor: hoveredButton === 'insights' ? '#ddd' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredButton('insights')}
            onMouseLeave={() => setHoveredButton(null)}
            >
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
            Active Projects
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#2f2e2e',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Current development initiatives, design implementations, and AI system integrations 
            across our collaborative workspace and dashboard ecosystem.
          </p>
        </div>

        {/* Project Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '60px'
        }}>
          
          {/* Active Projects */}
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
              Current Status
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
                  Living Spec Dashboard
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Fully operational dashboard featuring Netflix-style interface, semantic search capabilities, 
                  and comprehensive AI agent coordination system.
                </p>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#2f2e2e', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  fontWeight: '700',
                  backgroundColor: '#ddd',
                  padding: '8px 16px',
                  display: 'inline-block'
                }}>
                  Completed
                </div>
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
                  Krin Web Companion
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  RUM International inspired design system with functional navigation, 
                  memory archiving, and comprehensive project management interface.
                </p>
                <div style={{ 
                  fontSize: '12px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  fontWeight: '700',
                  backgroundColor: '#2d348b',
                  color: '#ffffff',
                  padding: '8px 16px',
                  display: 'inline-block'
                }}>
                  Active Development
                </div>
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
                  AI Team Coordination
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Seven specialized agents operating in perfect harmony across development, 
                  design, and project management workflows.
                </p>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#2f2e2e', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  fontWeight: '700',
                  backgroundColor: '#ddd',
                  padding: '8px 16px',
                  display: 'inline-block'
                }}>
                  Operational
                </div>
              </div>
            </div>
          </div>

          {/* Next Phase */}
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
              Next Phase
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
                Future development will focus on enhanced AI capabilities, expanded memory systems, 
                and deeper integration between dashboard components and personal assistant functionality.
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
                  Memory Enhancement
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
                  AI Integration
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