import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Users, Clock, ArrowRight, Zap } from 'lucide-react';
import { CoordinationCard } from '../ui/CoordinationCard';
import { StatusBadge } from '../ui/StatusBadge';
import { AIMessage, AIActivity } from '../../../types/coordination.types';

interface CommunicationFeedProps {
  messages: AIMessage[];
  activities: AIActivity[];
  className?: string;
  maxItems?: number;
}

const getMessageTypeColor = (type: string) => {
  const colors = {
    coordination: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    question: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    answer: 'bg-green-500/20 text-green-400 border-green-500/50',
    task: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    broadcast: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    system: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    active: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 animate-pulse'
  };
  return colors[type as keyof typeof colors] || colors.system;
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  
  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return time.toLocaleDateString();
};

interface CommunicationItemProps {
  item: AIMessage | AIActivity;
  index: number;
  isMessage: boolean;
}

const CommunicationItem: React.FC<CommunicationItemProps> = ({ item, index, isMessage }) => {
  if (isMessage) {
    const message = item as AIMessage;
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, x: -50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.95 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="communication-bubble group"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm">
              {message.sender_emoji}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-coordination-primary">
                  {message.sender_name}
                </span>
                <ArrowRight className="w-3 h-3 text-coordination-secondary" />
                <span className="text-xs text-coordination-secondary">
                  {message.to ? 'Direct Message' : 'Broadcast'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  status={message.type === 'coordination' ? 'active' : 'ready'} 
                  size="sm" 
                  showIcon={false}
                />
                <span className="text-xs text-coordination-secondary">
                  {formatTimeAgo(message.timestamp)}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-coordination-primary leading-relaxed mb-2">
              {message.message}
            </p>
            
            <div className="flex items-center gap-2">
              <span className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
                ${getMessageTypeColor(message.type)}
              `}>
                <MessageSquare className="w-3 h-3" />
                {message.type.toUpperCase()}
              </span>
              {message.context && (
                <span className="text-xs text-coordination-secondary">
                  + context data
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  } else {
    const activity = item as AIActivity;
    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="communication-bubble group border-l-4 border-l-blue-500"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">{activity.emoji}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-coordination-primary">
                  {activity.specialistName}
                </span>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  status={activity.type === 'active' ? 'active' : 'ready'} 
                  size="sm"
                />
                <span className="text-xs text-coordination-secondary">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-coordination-primary mb-2">
              {activity.message}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-coordination-secondary">
              <span className="px-2 py-1 bg-slate-700/50 rounded">
                {activity.type.replace('_', ' ').toUpperCase()}
              </span>
              {activity.metadata && (
                <span>• {Object.keys(activity.metadata).length} metadata items</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
};

export const CommunicationFeed: React.FC<CommunicationFeedProps> = ({
  messages,
  activities,
  className = '',
  maxItems = 50
}) => {
  const [combinedItems, setCombinedItems] = useState<Array<{item: AIMessage | AIActivity, isMessage: boolean, timestamp: Date}>>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Combine and sort messages and activities by timestamp
    const messageItems = messages.map(msg => ({
      item: msg,
      isMessage: true,
      timestamp: new Date(msg.timestamp)
    }));
    
    const activityItems = activities.map(activity => ({
      item: activity,
      isMessage: false,
      timestamp: new Date(activity.timestamp)
    }));

    const combined = [...messageItems, ...activityItems]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxItems);

    setCombinedItems(combined);
  }, [messages, activities, maxItems]);

  useEffect(() => {
    if (autoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [combinedItems, autoScroll]);

  const handleScroll = () => {
    if (feedRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <CoordinationCard className={`h-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-coordination-primary">
              Live Communication Feed
            </h2>
            <p className="text-sm text-coordination-secondary">
              Real-time AI-to-AI coordination and activities
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full live-indicator" />
            <span className="text-sm text-green-400 font-medium">LIVE</span>
          </div>
          <div className="text-sm text-coordination-secondary">
            {combinedItems.length} items
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/20 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-coordination-secondary">Messages</span>
          </div>
          <p className="text-lg font-bold text-blue-400">{messages.length}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-coordination-secondary">Activities</span>
          </div>
          <p className="text-lg font-bold text-yellow-400">{activities.length}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-coordination-secondary">Specialists</span>
          </div>
          <p className="text-lg font-bold text-purple-400">
            {new Set([...messages.map(m => m.from), ...activities.map(a => a.specialist)]).size}
          </p>
        </div>
      </div>

      {/* Feed Content */}
      <div 
        ref={feedRef}
        className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
        onScroll={handleScroll}
      >
        <AnimatePresence mode="popLayout">
          {combinedItems.map(({ item, isMessage }, index) => (
            <CommunicationItem
              key={`${isMessage ? 'msg' : 'act'}-${item.id}`}
              item={item}
              index={index}
              isMessage={isMessage}
            />
          ))}
        </AnimatePresence>
        
        {combinedItems.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Waiting for AI team communications...</p>
            <p className="text-sm text-gray-500">
              Messages and activities will appear here in real-time
            </p>
          </div>
        )}
      </div>

      {!autoScroll && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setAutoScroll(true);
            if (feedRef.current) {
              feedRef.current.scrollTop = feedRef.current.scrollHeight;
            }
          }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm transition-colors flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Jump to latest
        </motion.button>
      )}
    </CoordinationCard>
  );
};

export default CommunicationFeed;