'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
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
              System Configuration
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
              backgroundColor: '#ddd',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: '400',
              transition: 'background-color 0.2s ease'
            }}>
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
            System Settings
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#2f2e2e',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Configure AI agent behavior, memory retention, interface preferences, 
            and system integration settings for optimal performance.
          </p>
        </div>

        {/* Settings Categories */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '60px'
        }}>
          
          {/* AI Configuration */}
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
              AI Configuration
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
                  Memory Retention
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Configure how long conversation history and project memories are retained. 
                  Current setting preserves all collaborative sessions indefinitely.
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
                  Unlimited
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
                  Agent Coordination
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Manage how AI agents collaborate and share information across projects. 
                  Optimized for seamless workflow integration.
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
                  Active
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
                  Response Style
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Adjust personality and communication style for different contexts. 
                  Currently optimized for Nordic design aesthetic and editorial tone.
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
                  Editorial
                </div>
              </div>
            </div>
          </div>

          {/* Interface Preferences */}
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
              Interface Preferences
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
                  Design Theme
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Current theme follows RUM International aesthetic with clean typography, 
                  minimal colors, and generous white space for optimal readability.
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
                  Nordic Minimalist
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
                  Navigation Style
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Horizontal navigation with hover effects, centered layout, 
                  and clear visual hierarchy for intuitive user experience.
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
                  Horizontal
                </div>
              </div>
            </div>
          </div>

          {/* System Integration */}
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
              System Integration
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
                All systems are currently integrated and operational. The Living Spec Dashboard, 
                AI coordination network, and personal companion interface work together 
                seamlessly to provide comprehensive project management capabilities.
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
                  Export Settings
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
                  Reset to Default
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