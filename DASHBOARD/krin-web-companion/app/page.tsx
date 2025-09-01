'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function KrinCompanion() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#2f2e2e',
      lineHeight: '1.4'
    }}>
      {/* RUM-inspired Header */}
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
            <p style={{
              fontSize: '14px',
              color: '#2f2e2e',
              fontWeight: '400',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0'
            }}>
              Personal Assistant
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
              transition: 'background-color 0.2s ease',
              border: 'none'
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

      {/* Main Content - RUM style */}
      <div style={{ 
        maxWidth: '880px',
        margin: '0 auto',
        padding: '60px 20px'
      }}>
        
        {/* Hero Section */}
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
            Welcome Back
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#2f2e2e',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            All memories from our collaborative work on dashboards and AI coordination 
            remain carefully preserved, ready to inspire our next endeavors.
          </p>
          
          <button style={{
            padding: '12px 30px',
            backgroundColor: '#2d348b',
            color: '#ffffff',
            border: '1px solid #000000',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '400'
          }}>
            Get Started
          </button>
        </div>

        {/* Content Grid */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '60px'
        }}>
          
          {/* Status Section */}
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
              System Status
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '40px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px'
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
                  Complete dashboard implementation featuring editorial design system 
                  with seamless navigation and modern aesthetics.
                </p>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#2f2e2e', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  fontWeight: '700'
                }}>
                  Operational
                </div>
              </div>

              <div style={{
                textAlign: 'center',
                padding: '40px 20px'
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
                  AI Coordination Team
                </h4>
                <p style={{ 
                  color: '#2f2e2e', 
                  fontSize: '14px', 
                  marginBottom: '20px',
                  lineHeight: '1.6'
                }}>
                  Seven specialized agents working in perfect harmony to deliver 
                  comprehensive project solutions.
                </p>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#2f2e2e', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  fontWeight: '700'
                }}>
                  Active
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '15px',
              fontFamily: "'Playfair Display', serif",
              fontWeight: '700',
              marginBottom: '30px',
              color: '#2f2e2e',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              Quick Actions
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/memory" style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#2f2e2e',
                border: '1px solid #000000',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}>
                View Memories
              </Link>
              <Link href="/projects" style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#2f2e2e',
                border: '1px solid #000000',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'background-color 0.2s ease'
              }}>
                New Project
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}