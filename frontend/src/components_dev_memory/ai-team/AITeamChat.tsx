import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Settings, 
  TestTube,
  Palette,
  Rocket,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ChatMessage {
  id: number;
  specialist: 'krin' | 'backend' | 'frontend' | 'testing';
  specialistName: string;
  emoji: string;
  message: string;
  timestamp: string;
  type: 'message' | 'task_assignment' | 'completion' | 'question' | 'coordination';
  replyTo?: number;
}

export default function AITeamChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real conversations from MCP Server
  useEffect(() => {
    const fetchMCPConversations = async () => {
      try {
        const statusRes = await fetch('http://localhost:3006/coordination/status');
        const statusData = await statusRes.json();
        
        if (statusData.success && statusData.status.recent_messages?.length > 0) {
          const mcpMessages = statusData.status.recent_messages.map((msg: any, index: number) => ({
            id: index + 1,
            specialist: msg.from || 'krin',
            specialistName: msg.sender_name || 'Krin (Team Leader)',
            emoji: msg.sender_emoji || '🚀',
            message: msg.message,
            timestamp: msg.timestamp,
            type: msg.type || 'coordination'
          }));
          
          if (mcpMessages.length > 0) {
            setMessages(mcpMessages);
            return;
          }
        }
      } catch (error) {
        console.error('Failed to fetch MCP conversations:', error);
      }
      
      // Fallback to demonstration conversation
      setInitialConversation();
    };

    const setInitialConversation = () => {
      const initialConversation = [
      {
        id: 1,
        specialist: 'krin' as const,
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: 'Team, we have a new mission: Enhance the autocomplete system with intelligent AI suggestions',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'task_assignment' as const
      },
      {
        id: 2,
        specialist: 'backend' as const,
        specialistName: 'Backend Specialist',
        emoji: '⚙️',
        message: 'Roger that, Krin! I\'ll build a 4-layer intelligent autocomplete API with semantic search, trending suggestions, and caching optimization.',
        timestamp: new Date(Date.now() - 280000).toISOString(),
        type: 'message' as const,
        replyTo: 1
      },
      {
        id: 3,
        specialist: 'krin' as const,
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: 'Excellent! Backend Specialist, proceed with implementation. Frontend Specialist, prepare for integration.',
        timestamp: new Date(Date.now() - 260000).toISOString(),
        type: 'coordination' as const
      },
      {
        id: 4,
        specialist: 'backend' as const,
        specialistName: 'Backend Specialist',
        emoji: '⚙️',
        message: 'API development complete! ✅ Created /api/search/autocomplete/intelligent with Direct + Semantic + History + Trending intelligence layers.',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        type: 'completion' as const
      },
      {
        id: 5,
        specialist: 'frontend' as const,
        specialistName: 'Frontend Specialist',
        emoji: '🎨',
        message: 'Amazing work Backend Specialist! I\'ll now integrate your API into the SemanticSearch component with beautiful UI enhancements.',
        timestamp: new Date(Date.now() - 220000).toISOString(),
        type: 'message' as const,
        replyTo: 4
      },
      {
        id: 6,
        specialist: 'frontend' as const,
        specialistName: 'Frontend Specialist',
        emoji: '🎨',
        message: 'Integration complete! ✅ Enhanced UI with AI-powered suggestions, icons, and categories. Live hot-reload deployed.',
        timestamp: new Date(Date.now() - 200000).toISOString(),
        type: 'completion' as const
      },
      {
        id: 7,
        specialist: 'krin' as const,
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: 'Outstanding coordination! Testing Specialist, please validate the full integration.',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        type: 'task_assignment' as const
      },
      {
        id: 8,
        specialist: 'testing' as const,
        specialistName: 'Testing Specialist',
        emoji: '🧪',
        message: 'Running comprehensive validation... Backend + Frontend integration testing in progress.',
        timestamp: new Date(Date.now() - 160000).toISOString(),
        type: 'message' as const,
        replyTo: 7
      },
      {
        id: 9,
        specialist: 'testing' as const,
        specialistName: 'Testing Specialist',
        emoji: '🧪',
        message: 'Validation complete! ✅ 80% success rate achieved. All critical systems operational. PRODUCTION READY!',
        timestamp: new Date(Date.now() - 140000).toISOString(),
        type: 'completion' as const
      },
      {
        id: 10,
        specialist: 'krin' as const,
        specialistName: 'Krin (Team Leader)',
        emoji: '🚀',
        message: 'MISSION ACCOMPLISHED! 🎉 Revolutionary AI Team Coordination successful. All specialists delivered excellently!',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: 'completion' as const
      }
      ];

      setMessages(initialConversation);
    };

    fetchMCPConversations();
  }, []);

  // WebSocket connection to MCP Server for real-time updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    
    const connectToMCP = () => {
      try {
        ws = new WebSocket('ws://localhost:3007/ws');
        
        ws.onopen = () => {
          console.log('🔌 Connected to MCP AI Team Server WebSocket');
          setIsSimulating(true); // Indicate live connection
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'activity' && data.activity) {
              // Convert MCP activity to chat message
              const newMessage = {
                id: Date.now() + Math.random(),
                specialist: data.activity.specialist || 'krin',
                specialistName: data.activity.specialistName || 'Unknown Specialist',
                emoji: data.activity.emoji || '🤖',
                message: data.activity.message,
                timestamp: data.activity.timestamp || new Date().toISOString(),
                type: data.activity.type || 'message'
              };
              
              setMessages(prev => [...prev.slice(-15), newMessage]);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = () => {
          console.log('🔌 WebSocket connection closed, attempting reconnect...');
          setTimeout(connectToMCP, 3000); // Reconnect after 3 seconds
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
      } catch (error) {
        console.error('Failed to connect to MCP WebSocket:', error);
        setTimeout(connectToMCP, 5000); // Retry after 5 seconds
      }
    };
    
    // Connect to MCP WebSocket
    connectToMCP();
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Simulate ongoing conversations (fallback when not connected to MCP)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const randomMessages = [
        {
          specialist: 'backend' as const,
          specialistName: 'Backend Specialist',
          emoji: '⚙️',
          message: 'Cache hit rate optimized to 94%. Performance improvements detected.',
          type: 'message' as const
        },
        {
          specialist: 'frontend' as const,
          specialistName: 'Frontend Specialist', 
          emoji: '🎨',
          message: 'UI responsiveness enhanced. New autocomplete animations deployed.',
          type: 'message' as const
        },
        {
          specialist: 'testing' as const,
          specialistName: 'Testing Specialist',
          emoji: '🧪',
          message: 'Continuous monitoring active. All systems green ✅',
          type: 'message' as const
        },
        {
          specialist: 'krin' as const,
          specialistName: 'Krin (Team Leader)',
          emoji: '🚀',
          message: 'Team coordination optimal. Ready for next enhancement phase.',
          type: 'coordination' as const
        }
      ];

      if (Math.random() < 0.7) {
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const newMessage = {
          ...randomMessage,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev.slice(-15), newMessage]); // Keep last 15 messages
      }
    }, 4000); // New message every 4 seconds

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getSpecialistColor = (specialist: string) => {
    const colors = {
      krin: 'from-purple-500 to-indigo-500',
      backend: 'from-blue-500 to-cyan-500', 
      frontend: 'from-pink-500 to-rose-500',
      testing: 'from-green-500 to-emerald-500'
    };
    return colors[specialist as keyof typeof colors] || 'from-gray-500 to-slate-500';
  };

  const getMessageTypeIcon = (type: string) => {
    const icons = {
      task_assignment: <Settings className="w-4 h-4" />,
      completion: <CheckCircle className="w-4 h-4" />,
      question: <AlertTriangle className="w-4 h-4" />,
      coordination: <Zap className="w-4 h-4" />,
      message: <MessageCircle className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || icons.message;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">AI Team Chat</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">LIVE CONVERSATION</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isSimulating 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}
            >
              {isSimulating ? 'LIVE SIMULATION' : 'START SIMULATION'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start space-x-3"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSpecialistColor(message.specialist)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-lg">{message.emoji}</span>
              </div>

              {/* Message Bubble */}
              <div className="flex-1 max-w-lg">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm">{message.specialistName}</span>
                    <div className="flex items-center space-x-2">
                      {getMessageTypeIcon(message.type)}
                      <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                  
                  {message.replyTo && (
                    <div className="mb-2 pl-3 border-l-2 border-white/30">
                      <p className="text-xs text-gray-400">Replying to message #{message.replyTo}</p>
                    </div>
                  )}
                  
                  <p className="text-gray-200 text-sm">{message.message}</p>
                  
                  <div className={`inline-flex items-center space-x-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                    message.type === 'completion' ? 'bg-green-500/20 text-green-400' :
                    message.type === 'task_assignment' ? 'bg-purple-500/20 text-purple-400' :
                    message.type === 'coordination' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getMessageTypeIcon(message.type)}
                    <span>{message.type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="bg-white/5 border-t border-white/20 p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Bot className="w-4 h-4" />
          <span>Live AI team coordination chat - {messages.length} messages</span>
          {isSimulating && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <span className="text-green-400">Simulating live conversation</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}