import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Clock,
  MessageSquare,
  Code,
  TestTube,
  Settings,
  Rocket,
  Pause,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AIActivity {
  id: string;
  timestamp: string;
  specialist: string;
  specialistEmoji: string;
  action: string;
  message: string;
  type: 'started' | 'progress' | 'completed' | 'error' | 'communication' | 'coordination';
  details?: string;
  duration?: number;
}

interface LiveActivityFeedProps {
  maxMessages?: number;
  className?: string;
}

export default function LiveActivityFeed({ maxMessages = 50, className }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<AIActivity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Connect to WebSocket
  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:3007/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 Connected to AI Team WebSocket');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Add connection message
        addActivity({
          id: `connect-${Date.now()}`,
          timestamp: new Date().toISOString(),
          specialist: 'System',
          specialistEmoji: '🔌',
          action: 'Connected to AI Team',
          message: 'Live activity feed connected successfully',
          type: 'coordination'
        });
      };

      ws.onmessage = (event) => {
        if (isPaused) return;
        
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'activity' && data.activity) {
            const activity = data.activity;
            addActivity({
              id: activity.id || `activity-${Date.now()}`,
              timestamp: activity.timestamp || new Date().toISOString(),
              specialist: activity.specialistName || 'Unknown',
              specialistEmoji: activity.emoji || '🤖',
              action: activity.type || 'action',
              message: activity.message || 'AI Activity',
              type: mapActivityType(activity.type),
              details: activity.details,
              duration: activity.duration
            });
          }
          
          // Handle coordination messages
          if (data.type === 'coordination') {
            addActivity({
              id: `coord-${Date.now()}`,
              timestamp: new Date().toISOString(),
              specialist: 'Krin Coordinator',
              specialistEmoji: '🚀',
              action: 'Team Coordination',
              message: data.message || 'Coordinating AI team activities',
              type: 'coordination',
              details: data.details
            });
          }

          // Handle specialist messages
          if (data.type === 'specialist_message') {
            addActivity({
              id: `msg-${Date.now()}`,
              timestamp: new Date().toISOString(),
              specialist: data.from || 'AI Specialist',
              specialistEmoji: getSpecialistEmoji(data.from),
              action: 'Communication',
              message: data.message || 'Inter-AI communication',
              type: 'communication',
              details: `To: ${data.to || 'Team'}`
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 Disconnected from AI Team WebSocket');
        setIsConnected(false);
        
        addActivity({
          id: `disconnect-${Date.now()}`,
          timestamp: new Date().toISOString(),
          specialist: 'System',
          specialistEmoji: '⚠️',
          action: 'Disconnected',
          message: 'Connection lost. Attempting to reconnect...',
          type: 'error'
        });

        // Attempt to reconnect
        if (connectionAttempts < 5) {
          setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connectWebSocket();
          }, 2000 + (connectionAttempts * 1000));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addActivity({
          id: `error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          specialist: 'System',
          specialistEmoji: '❌',
          action: 'Connection Error',
          message: 'WebSocket connection error occurred',
          type: 'error'
        });
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Add activity to list
  const addActivity = (activity: AIActivity) => {
    setActivities(prev => {
      const newActivities = [activity, ...prev].slice(0, maxMessages);
      return newActivities;
    });
  };

  // Map activity types
  const mapActivityType = (type: string): AIActivity['type'] => {
    const typeMap: Record<string, AIActivity['type']> = {
      'started': 'started',
      'progress': 'progress', 
      'completed': 'completed',
      'error': 'error',
      'communication': 'communication',
      'coordination': 'coordination',
      'active': 'progress',
      'success': 'completed',
      'warning': 'error'
    };
    return typeMap[type] || 'progress';
  };

  // Get specialist emoji
  const getSpecialistEmoji = (name: string): string => {
    const emojiMap: Record<string, string> = {
      'Backend Specialist': '⚙️',
      'Frontend Specialist': '🎨', 
      'Testing Specialist': '🧪',
      'DevOps Specialist': '🚀',
      'Architecture Specialist': '🏗️',
      'Krin': '🚀',
      'System': '🔧'
    };
    
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name?.includes(key)) return emoji;
    }
    return '🤖';
  };

  // Get activity icon and color
  const getActivityStyle = (type: AIActivity['type']) => {
    const styles = {
      started: {
        icon: Play,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950',
        border: 'border-blue-200 dark:border-blue-800'
      },
      progress: {
        icon: Activity,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        border: 'border-yellow-200 dark:border-yellow-800'
      },
      completed: {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-50 dark:bg-green-950', 
        border: 'border-green-200 dark:border-green-800'
      },
      error: {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800'
      },
      communication: {
        icon: MessageSquare,
        color: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-950',
        border: 'border-purple-200 dark:border-purple-800'
      },
      coordination: {
        icon: Rocket,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-950',
        border: 'border-indigo-200 dark:border-indigo-800'
      }
    };
    return styles[type] || styles.progress;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 10) return 'now';
    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffMins < 60) return `${diffMins}m`;
    return activityTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (autoScroll && activityEndRef.current) {
      activityEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities, autoScroll]);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Clear activities
  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <div className={cn("h-full flex flex-col bg-card border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Brain className="h-5 w-5 text-primary" />
            <div className={cn(
              "absolute -top-1 -right-1 w-2 h-2 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Live AI Activity</h3>
            <p className="text-xs text-muted-foreground">
              {isConnected ? 'Connected to AI Team' : 'Reconnecting...'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="h-8 px-2"
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearActivities}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Activity Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Waiting for AI team activity...</p>
            <p className="text-xs mt-1">
              {isConnected ? 'Connected and monitoring' : 'Connecting to AI team...'}
            </p>
          </div>
        ) : (
          <>
            {activities.map((activity) => {
              const style = getActivityStyle(activity.type);
              const Icon = style.icon;
              
              return (
                <div
                  key={activity.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all hover:shadow-sm",
                    style.bg,
                    style.border
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <span className="text-lg">{activity.specialistEmoji}</span>
                      <Icon className={cn("h-3 w-3 mt-1", style.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {activity.specialist}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={cn("text-xs font-medium uppercase tracking-wide", style.color)}>
                            {activity.action}
                          </span>
                          {activity.duration && (
                            <span className="text-xs text-muted-foreground">
                              ({activity.duration}ms)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{activity.message}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground italic">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={activityEndRef} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span>{activities.length} activities</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
}