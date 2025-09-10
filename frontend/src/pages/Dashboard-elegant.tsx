import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Brain, 
  FileText, 
  BarChart3, 
  LogOut,
  Users,
  TrendingUp
} from 'lucide-react'

export function Dashboard() {
  const { state, logout } = useAuth()

  if (!state.user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '1px',
            height: '40px', 
            backgroundColor: '#000000',
            margin: '0 auto 20px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}></div>
          <p style={{ color: '#666666', fontSize: '14px', fontWeight: 400 }}>LOADING</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .dashboard-container {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .playfair {
          font-family: 'Playfair Display', serif;
        }
        
        .dashboard-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        
        .dashboard-btn:hover {
          opacity: 0.7;
        }
        
        .stat-item {
          padding: 40px 0;
          border-bottom: 1px solid #e5e5e5;
          transition: background-color 0.2s ease;
        }
        
        .stat-item:hover {
          background-color: #fafafa;
        }
        
        .activity-line {
          padding: 24px 0;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }
        
        .activity-line:hover {
          background-color: #fafafa;
        }
        
        .action-item {
          padding: 32px;
          border: 1px solid #e5e5e5;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .action-item:hover {
          background-color: #f8f8f8;
          border-color: #d0d0d0;
        }
      `}</style>
      
      <div className="dashboard-container" style={{ 
        minHeight: '100vh', 
        backgroundColor: '#ffffff',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        overflow: 'auto'
      }}>
        
        {/* Clean Header - RUM Inspired */}
        <header style={{
          borderBottom: '1px solid #e5e5e5',
          position: 'sticky',
          top: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Brain style={{ width: '18px', height: '18px', color: 'white' }} />
              </div>
              <div>
                <div style={{ 
                  fontWeight: 600, 
                  color: '#000000', 
                  fontSize: '16px',
                  letterSpacing: '1px'
                }}>KRINS</div>
              </div>
            </div>
            
            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '14px',
                  color: '#000000',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>{state.user.name}</div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {state.user.role}
                </div>
              </div>
              <button 
                className="dashboard-btn"
                onClick={logout}
                style={{
                  fontSize: '12px',
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <LogOut style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 40px'
        }}>
          
          {/* Hero - Editorial Style */}
          <section style={{ 
            marginBottom: '120px',
            textAlign: 'center'
          }}>
            <h1 className="playfair" style={{
              fontSize: '48px',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '24px',
              letterSpacing: '-0.5px',
              lineHeight: 1.2
            }}>
              Organizational Intelligence
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666666',
              marginBottom: '40px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontWeight: 400
            }}>
              Dashboard
            </p>
            
            <div style={{
              width: '2px',
              height: '60px',
              backgroundColor: '#000000',
              margin: '0 auto'
            }}></div>
          </section>

          {/* Stats - Clean List */}
          <section style={{ marginBottom: '120px' }}>
            <h2 className="playfair" style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '60px',
              textAlign: 'center'
            }}>Overview</h2>
            
            <div>
              {[
                { value: '24', label: 'Active Architecture Decision Records', change: '12% increase' },
                { value: '12', label: 'Team Members Contributing', change: '3 new members' },
                { value: '92%', label: 'Decision Implementation Rate', change: '5% improvement' },
                { value: '47', label: 'AI-Generated Insights', change: '18 new today' }
              ].map((stat, index) => (
                <div key={index} className="stat-item">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 className="playfair" style={{
                        fontSize: '64px',
                        fontWeight: 400,
                        color: '#000000',
                        margin: 0,
                        lineHeight: 1
                      }}>{stat.value}</h3>
                    </div>
                    <div style={{ flex: 2, textAlign: 'right' }}>
                      <p style={{
                        fontSize: '16px',
                        color: '#000000',
                        margin: 0,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>{stat.label}</p>
                      <p style={{
                        fontSize: '14px',
                        color: '#666666',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>{stat.change}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity - Editorial List */}
          <section style={{ marginBottom: '120px' }}>
            <h2 className="playfair" style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '60px',
              textAlign: 'center'
            }}>Recent Activity</h2>
            
            <div>
              {[
                { 
                  title: 'ADR-024: API Gateway Strategy', 
                  desc: 'New architecture decision record created for microservices implementation', 
                  time: '2 minutes ago' 
                },
                { 
                  title: 'Team Review Session', 
                  desc: 'Five members actively reviewing database optimization decisions', 
                  time: '15 minutes ago' 
                },
                { 
                  title: 'AI Pattern Analysis', 
                  desc: 'Performance patterns identified in authentication service', 
                  time: '1 hour ago' 
                }
              ].map((item, index) => (
                <article key={index} className="activity-line">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#000000',
                        margin: 0,
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>{item.title}</h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#666666',
                        margin: 0,
                        lineHeight: 1.6
                      }}>{item.desc}</p>
                    </div>
                    <time style={{
                      fontSize: '14px',
                      color: '#999999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      whiteSpace: 'nowrap',
                      marginLeft: '24px'
                    }}>{item.time}</time>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Quick Actions - Grid */}
          <section>
            <h2 className="playfair" style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#000000',
              marginBottom: '60px',
              textAlign: 'center'
            }}>Quick Actions</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1px',
              border: '1px solid #e5e5e5'
            }}>
              {[
                { 
                  icon: FileText, 
                  title: 'Create ADR', 
                  desc: 'Document new architecture decisions'
                },
                { 
                  icon: BarChart3, 
                  title: 'View Analytics', 
                  desc: 'Explore decision patterns and metrics'
                },
                { 
                  icon: Brain, 
                  title: 'AI Insights', 
                  desc: 'Get intelligent recommendations'
                }
              ].map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={index}
                    className="dashboard-btn action-item"
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <Icon style={{
                      width: '24px',
                      height: '24px',
                      color: '#000000',
                      marginBottom: '20px'
                    }} />
                    
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#000000',
                      margin: 0,
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>{action.title}</h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666666',
                      margin: 0,
                      lineHeight: 1.6
                    }}>{action.desc}</p>
                  </button>
                )
              })}
            </div>
          </section>

        </main>
      </div>
    </>
  )
}