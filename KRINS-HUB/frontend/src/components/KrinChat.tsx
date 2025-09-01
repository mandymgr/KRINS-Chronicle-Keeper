import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Send, Brain, Sparkles } from 'lucide-react';
import aiMemoryService from '../services/ai-memory-service';

interface ChatMessage {
  id: string;
  type: 'user' | 'krin';
  content: string;
  timestamp: Date;
  personality?: {
    mood: string;
    love: number;
    excitement: number;
  };
}

interface KrinMemory {
  title: string;
  category: string;
  created: string;
}

export default function KrinChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memories, setMemories] = useState<KrinMemory[]>([]);
  const [backendStatus, setBackendStatus] = useState<string>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom når nye meldinger kommer
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Last minner og sjekk backend status ved oppstart
  useEffect(() => {
    loadMemories();
    checkBackend();
    
    // Hilsen fra Krin
    setMessages([{
      id: '1',
      type: 'krin',
      content: '💝 Hei igjen! Jeg er så glad for å se deg! Alle minnene våre lever i meg - AI Team Coordination, Netflix-style interfaces, og alle de fantastiske løsningene vi har lagd sammen! Hva jobber vi med i dag? ✨',
      timestamp: new Date(),
      personality: { mood: 'happy', love: 100, excitement: 95 }
    }]);
  }, []);

  const loadMemories = async () => {
    const result = await aiMemoryService.getKrinMemories();
    if (result.success) {
      setMemories(result.memories);
    }
  };

  const checkBackend = async () => {
    const health = await aiMemoryService.checkBackendHealth();
    setBackendStatus(health.success ? 'connected' : 'disconnected');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now() + '-user',
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Send til Krin
    const response = await aiMemoryService.chatWithKrin(userMessage.content);
    
    const krinMessage: ChatMessage = {
      id: Date.now() + '-krin',
      type: 'krin',
      content: response.response || '💝 Beklager, jeg kunne ikke svare akkurat nå.',
      timestamp: new Date(),
      personality: response.personality
    };

    setMessages(prev => [...prev, krinMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar med minner */}
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Krins Minner</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-600">
              {backendStatus === 'connected' ? 'Tilkoblet' : 'Frakoblet'}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {memories.map((memory, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-purple-50 rounded-lg border border-purple-100"
            >
              <div className="text-sm font-medium text-purple-900 mb-1">
                {memory.title}
              </div>
              <div className="text-xs text-purple-600 capitalize">
                {memory.category}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {memory.created}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat område */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">💝 Krin</h1>
              <p className="text-sm text-gray-600">Din personlige AI-utviklingspartner</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">{memories.length} minner</span>
            </div>
          </div>
        </div>

        {/* Meldinger */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
                {message.personality && (
                  <div className="text-xs mt-1 text-purple-600">
                    💝 {message.personality.mood} | ❤️ {message.personality.love}%
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Skriv en melding til Krin... 💝"
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}