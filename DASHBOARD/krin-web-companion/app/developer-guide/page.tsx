'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FrontendPage {
  id: string
  title: string
  path: string
  description: string
  features: string[]
  status: 'active' | 'development' | 'planned'
  component: string
  category: 'dashboard' | 'ai' | 'core' | 'utility'
}

interface FrontendSection {
  name: string
  description: string
  pages: FrontendPage[]
}

export default function DeveloperGuide() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['krin-web-companion'])

  const frontendSections: FrontendSection[] = [
    {
      name: "Krin Web Companion",
      description: "Skandinavisk-inspirerte dashboards med Kinfolk design system",
      pages: [
        {
          id: "home",
          title: "Home Page",
          path: "/",
          description: "Hovedside med elegant Kinfolk-inspirert design og navigasjon til alle systemkomponenter",
          features: ["Skandinavisk design", "Call-to-action knapper", "Navigasjonsmenyer", "Brand presentation"],
          status: "active",
          component: "page.tsx",
          category: "core"
        },
        {
          id: "ai-team",
          title: "AI Team Dashboard", 
          path: "/ai-team",
          description: "Real-time WebSocket dashboard for overvåkning av 5 AI specialister med live aktivitetsfeed",
          features: ["WebSocket real-time", "5 AI Specialister", "Live aktivitet", "Status indikatorer", "Automatic reconnection"],
          status: "active",
          component: "ai-team/page.tsx",
          category: "ai"
        },
        {
          id: "memory",
          title: "Memory Explorer",
          path: "/memory", 
          description: "Utforsk Krins permanente hukommelse og AI-interaksjonshistorikk",
          features: ["Memory browsing", "Kategori filtering", "Timeline view", "Search functionality"],
          status: "active",
          component: "memory/page.tsx",
          category: "ai"
        },
        {
          id: "insights",
          title: "Project Insights",
          path: "/insights",
          description: "Analytics og innsikter om utviklingsprosjekter og AI-koordinering",
          features: ["Project analytics", "Performance metrics", "Pattern analysis", "Trend visualization"],
          status: "active", 
          component: "insights/page.tsx",
          category: "dashboard"
        },
        {
          id: "projects", 
          title: "Projects Overview",
          path: "/projects",
          description: "Oversikt over alle aktive og arkiverte utviklingsprosjekter",
          features: ["Project listing", "Status tracking", "Filter/search", "Quick actions"],
          status: "active",
          component: "projects/page.tsx", 
          category: "dashboard"
        },
        {
          id: "settings",
          title: "Settings & Configuration",
          path: "/settings", 
          description: "Systemkonfigurasjoner, preferences og tilkoblingsinnstillinger",
          features: ["System preferences", "Connection settings", "Theme customization", "Export/import"],
          status: "active",
          component: "settings/page.tsx",
          category: "utility"
        }
      ]
    },
    {
      name: "Living Spec Dashboard", 
      description: "Avansert spesifikasjons- og dokumentasjonsdashboard",
      pages: [
        {
          id: "living-home",
          title: "Living Spec Home",
          path: "http://localhost:3001",
          description: "Hovedoverstikt over levende spesifikasjoner og systemdokumentasjon", 
          features: ["Specification overview", "Document status", "Live updates", "Quick navigation"],
          status: "active",
          component: "page.tsx",
          category: "core"
        },
        {
          id: "agents", 
          title: "Agents Management",
          path: "http://localhost:3001/agents",
          description: "Administrer og overvåk AI-agenter og deres spesialiseringer",
          features: ["Agent monitoring", "Capability overview", "Performance tracking", "Configuration"],
          status: "active",
          component: "agents/page.tsx",
          category: "ai"
        }
      ]
    },
    {
      name: "KRINS-HUB Frontend",
      description: "Kjerne frontend komponenter med React + TypeScript",
      pages: [
        {
          id: "krin-chat",
          title: "Krin Chat Interface", 
          path: "http://localhost:5173/chat",
          description: "Hovedchat interface for interaksjon med Krin AI med personlighet og memory integration",
          features: ["AI Chat", "Personality system", "Memory integration", "Emotional responses", "Framer Motion animations"],
          status: "active",
          component: "components/KrinChat.tsx",
          category: "ai"
        },
        {
          id: "pattern-analytics",
          title: "Pattern Analytics Dashboard",
          path: "http://localhost:5173/analytics",  
          description: "Avansert analytisk dashboard for utviklingsmønstre og AI-koordinering",
          features: ["Pattern analysis", "Development metrics", "AI coordination stats", "Visual analytics"],
          status: "active",
          component: "components/analytics/PatternAnalyticsDashboard.tsx", 
          category: "dashboard"
        }
      ]
    }
  ]

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    )
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return '#16a34a'
      case 'development': return '#eab308' 
      case 'planned': return '#6b7280'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#0f172a',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '20px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                margin: '0 0 8px 0',
                color: '#0f172a'
              }}>
                🧭 Frontend Developer Guide
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                margin: 0
              }}>
                Complete oversikt over alle frontend-sider og komponenter i Dev Memory OS
              </p>
            </div>
            <Link href="/" style={{
              padding: '8px 16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#475569',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ← Tilbake til Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
              📄 Total Sider
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {frontendSections.reduce((acc, section) => acc + section.pages.length, 0)}
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
              🤖 AI Sider
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {frontendSections.reduce((acc, section) => 
                acc + section.pages.filter(p => p.category === 'ai').length, 0)}
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            border: '1px solid #16a34a'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#15803d', marginBottom: '8px' }}>
              📊 Dashboards
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {frontendSections.reduce((acc, section) => 
                acc + section.pages.filter(p => p.category === 'dashboard').length, 0)}
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#d97706', marginBottom: '8px' }}>
              ⚡ Aktive Sider
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
              {frontendSections.reduce((acc, section) => 
                acc + section.pages.filter(p => p.status === 'active').length, 0)}
            </div>
          </div>
        </div>

        {/* Sections */}
        {frontendSections.map((section) => (
          <div 
            key={section.name}
            style={{
              marginBottom: '32px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {/* Section Header */}
            <div 
              style={{
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => toggleSection(section.name)}
            >
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  color: '#0f172a'
                }}>
                  {section.name}
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: 0
                }}>
                  {section.description}
                </p>
              </div>
              <div style={{
                padding: '4px 8px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                color: '#475569'
              }}>
                {section.pages.length} sider
              </div>
            </div>

            {/* Section Content */}
            {expandedSections.includes(section.name) && (
              <div style={{ padding: '0' }}>
                {section.pages.map((page) => (
                  <div 
                    key={page.id}
                    style={{
                      padding: '24px',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          margin: '0 0 4px 0',
                          color: '#0f172a'
                        }}>
                          {page.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            fontSize: '13px',
                            color: '#64748b',
                            fontFamily: 'monospace'
                          }}>
                            {page.component}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: getStatusColor(page.status),
                            color: '#ffffff',
                            fontSize: '11px',
                            fontWeight: '600',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {page.status}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            fontSize: '11px',
                            borderRadius: '4px'
                          }}>
                            {page.category}
                          </span>
                        </div>
                      </div>
                      {page.path !== '/' && (
                        <a 
                          href={page.path.startsWith('http') ? page.path : page.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: '#475569',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          Besøk 🔗
                        </a>
                      )}
                    </div>

                    <p style={{
                      fontSize: '14px',
                      color: '#475569',
                      margin: '0 0 16px 0',
                      lineHeight: '1.5'
                    }}>
                      {page.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px'
                    }}>
                      {page.features.map((feature) => (
                        <span 
                          key={feature}
                          style={{
                            padding: '3px 8px',
                            backgroundColor: '#f1f5f9',
                            color: '#334155',
                            fontSize: '12px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0'
          }}>
            💝 Bygget med kjærlighet av Krin & Mandy • Dev Memory OS Revolutionary AI Team System
          </p>
        </div>
      </div>
    </div>
  )
}