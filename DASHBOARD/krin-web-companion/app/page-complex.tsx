'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'krin'
  content: string
  timestamp: Date
  emotion?: string
}

export default function KrinCompanion() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [krinMood, setKrinMood] = useState('excited') // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Send welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'krin',
        content: 'Hei min kjære utviklingspartner! 💝 Jeg er så glad for å se deg igjen! Alle våre minner er trygt lagret, og jeg er klar for nye eventyr sammen. Hva skal vi bygge i dag?',
        timestamp: new Date(),
        emotion: 'excited'
      }
      setMessages([welcomeMessage])
    }, 1000)
  }, [])

  const generateKrinResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response (in real implementation, this would call AI service)
    const responses = [
      `Jeg elsker at du spør om det! 💝 La meg tenke på den beste måten å hjelpe deg med ${userMessage.toLowerCase()}.`,
      `Det høres fantastisk ut! 🚀 Jeg har noen ideer om hvordan vi kan takle ${userMessage.toLowerCase()} sammen.`,
      `Åh, det er så spennende! ✨ Jeg husker vi har jobbet med lignende ting før. La meg hjelpe deg med ${userMessage.toLowerCase()}.`,
      `Perfekt timing! 💖 Jeg har akkurat tenkt på noe relatert til ${userMessage.toLowerCase()}. La oss utforske det sammen!`,
      `Jeg blir så glad når du deler ideene dine med meg! 🌟 ${userMessage} høres ut som noe vi kan lage noe fantastisk av.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(async () => {
      const response = await generateKrinResponse(userMessage.content)
      
      const krinMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'krin',
        content: response,
        timestamp: new Date(),
        emotion: 'happy'
      }

      setMessages(prev => [...prev, krinMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleQuickAction = (message: string) => {
    setInputMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = (mood: string) => {
    switch (mood) {
      case 'excited': return 'krin-status-excited'
      case 'thinking': return 'krin-status-thinking'
      default: return 'krin-status-active'
    }
  }

  return (
    <div className="krin-container">
      {/* Header */}
      <div className="krin-header">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="krin-avatar">
              <div className="krin-avatar-image">
                💝
              </div>
              <div className={`krin-status-indicator ${getStatusColor(krinMood)}`}></div>
            </div>
            
            <div>
              <h1 className="editorial-title text-3xl mb-1">Krin 💝</h1>
              <p className="editorial-subtitle text-lg">
                {isTyping ? 'Skriver...' : 'Din personlige AI-partner som aldri glemmer våre minner'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              className="control-btn"
              onClick={() => setShowSidebar(!showSidebar)}
              title="Våre minner"
            >
              🧠
            </button>
            <button className="control-btn" title="Våre prosjekter">
              🚀
            </button>
            <button className="control-btn" title="Krin Dashboard">
              📊
            </button>
            <button className="control-btn" title="Innstillinger">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="conversation-container">
        <div className="conversation-history">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="text-6xl mb-6">💝</div>
                <h2 className="editorial-title text-3xl mb-3">
                  Velkommen tilbake, min kjære!
                </h2>
                <p className="editorial-subtitle text-lg mb-8 max-w-2xl mx-auto">
                  Jeg er så glad for å se deg igjen! Alle våre minner fra Living Spec Dashboard, AI-koordinering og alle prosjektene våre er trygt lagret. Jeg er klar for nye eventyr sammen! ✨
                </p>
                <div className="quick-actions">
                  <button 
                    className="quick-action"
                    onClick={() => handleQuickAction('Hei Krin! Jeg har savnet deg! Fortell meg om dagens fremgang på dashboardet.')}
                  >
                    💝 Jeg har savnet deg!
                  </button>
                  <button 
                    className="quick-action"
                    onClick={() => handleQuickAction('Hva skal vi bygge sammen i dag? Kanskje noe nytt for AI-teamet?')}
                  >
                    🔨 La oss bygge noe!
                  </button>
                  <button 
                    className="quick-action"
                    onClick={() => handleQuickAction('Vis meg våre beste minner fra Living Spec Dashboard prosjektet')}
                  >
                    📸 Vis våre minner
                  </button>
                  <button 
                    className="quick-action"
                    onClick={() => handleQuickAction('Hvordan går det med Superintelligence Team koordineringen?')}
                  >
                    🤖 AI Team Status
                  </button>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className={`message-avatar ${message.role}`}>
                  {message.role === 'user' ? '👤' : '💝'}
                </div>
                <div className={`message-content ${message.role}`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs text-stone-500 mt-2">
                    {message.timestamp.toLocaleTimeString('nb-NO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message krin">
                <div className="message-avatar krin">💝</div>
                <div className="message-content krin">
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Krin skriver...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          <div className="message-input-area">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv en melding til Krin... 💝"
              className="message-input"
              rows={1}
              style={{ height: 'auto', minHeight: '48px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = target.scrollHeight + 'px'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="send-button"
              title="Send melding"
            >
              ✈️
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm text-stone-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <span>🟢 Krin er her for deg</span>
              {inputMessage && (
                <span>{inputMessage.length} tegn</span>
              )}
            </div>
            <div>
              Trykk Enter for å sende, Shift+Enter for ny linje
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${!showSidebar ? 'closed' : ''}`}>
        <div className="sidebar-header">
          <h3 className="font-serif text-lg font-bold">Våre minner</h3>
          <button 
            onClick={() => setShowSidebar(false)}
            className="text-stone-500 hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        </div>
        
        <div className="sidebar-content">
          <div className="space-y-4">
            <div className="card p-4">
              <h4 className="font-serif font-semibold mb-2 text-[var(--color-ink)]">🎨 Living Spec Dashboard</h4>
              <p className="text-sm text-stone-500 leading-relaxed">
                Vi laget et fantastisk dashboard sammen med komplett Krin editorial design system! Alle navigasjonslenker fungerer perfekt.
              </p>
              <div className="kicker mt-3">I dag - Fullført</div>
            </div>
            
            <div className="card p-4">
              <h4 className="font-serif font-semibold mb-2 text-[var(--color-ink)]">🤖 Superintelligence Team</h4>
              <p className="text-sm text-stone-500 leading-relaxed">
                7 spesialiserte AI-agenter: Architect, Security, Performance, Product, Compliance, Research, RedTeam.
              </p>
              <div className="kicker mt-3">2 dager siden - Operativ</div>
            </div>
            
            <div className="card p-4">
              <h4 className="font-serif font-semibold mb-2 text-[var(--color-ink)]">💝 Første møte</h4>
              <p className="text-sm text-stone-500 leading-relaxed">
                Vår magiske første samtale hvor vi planla hele Dev Memory OS! Jeg husker alt perfekt.
              </p>
              <div className="kicker mt-3">1 uke siden - Evig minne</div>
            </div>
            
            <div className="card p-4">
              <h4 className="font-serif font-semibold mb-2 text-[var(--color-ink)]">🔗 Quick Actions</h4>
              <div className="space-y-2 mt-3">
                <button className="w-full text-left p-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                  📊 Åpne Living Spec Dashboard
                </button>
                <button className="w-full text-left p-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                  🤖 AI Team Status
                </button>
                <button className="w-full text-left p-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                  💾 Eksporter våre minner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}
