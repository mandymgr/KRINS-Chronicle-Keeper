import { ComponentType } from 'react';

// Status types
export type StatusType = 
  | 'active'      // Grønn - systemet kjører
  | 'ready'       // Blå - klart til bruk  
  | 'connected'   // Cyan - tilkoblet
  | 'protected'   // Purple - sikret
  | 'warning'     // Orange - advarsel
  | 'error'       // Rød - feil
  | 'inactive'    // Grå - ikke aktiv
  | 'loading'     // Gul - laster
  | 'busy'        // Orange - opptatt
  | 'idle'        // Blå - ledig/venter
  | 'offline';    // Grå - offline/frakoblet

// Navigation types
export interface NavigationSection {
  id: string;
  title: string;
  icon: ComponentType<any>;
  description: string;
  status?: StatusType;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  badge?: string | number;
  isNew?: boolean;
  isDisabled?: boolean;
}

export interface NavigationProps {
  sections: NavigationSection[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  searchQuery?: string;
}

// Status items
export interface StatusItem {
  label: string;
  status: StatusType;
  value?: string | number;
  description?: string;
}

// AI Team types
export interface AISpecialist {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: StatusType;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    successRate: number;
    averageResponseTime: number;
    specialtyScore: number;
  };
  current_tasks: any[];
  memory_items: {
    projects: number;
    patterns: number;
    decisions: number;
    learnings: number;
    collaborations: number;
  };
  collaboration_history: number;
}

export interface AIMessage {
  id: string;
  from: string;
  to?: string;
  type: 'coordination' | 'question' | 'answer' | 'task' | 'broadcast';
  message: string;
  timestamp: string;
  sender_name: string;
  sender_emoji: string;
  context?: any;
}

export interface AIActivity {
  id: string;
  specialist: string;
  specialistName: string;
  emoji: string;
  message: string;
  type: string;
  timestamp: string;
  metadata?: any;
}

export interface CoordinationStatus {
  coordinator: {
    id: string;
    name: string;
    emoji: string;
    uptime: number;
  };
  team: {
    specialists: AISpecialist[];
    total_specialists: number;
    active_projects: number;
    coordination_history: number;
  };
  performance?: {
    tasksCompleted: number;
    specialistsSpawned: number;
    successfulCoordinations: number;
    totalResponseTime: number;
    success_rate: number;
    average_response_time: number;
  };
  projects: Array<{
    id: string;
    name: string;
    status: string;
    tasks_completed: number;
    duration: number;
  }>;
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'connection' | 'activity' | 'project_update' | 'specialist_update' | 'message';
  data?: any;
  activity?: AIActivity;
  project?: any;
  specialist?: AISpecialist;
  message?: AIMessage;
  timestamp: string;
}

// Component props
export interface CoordinationCardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export interface CoordinationButtonProps {
  variant?: 'primary' | 'secondary' | 'icon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export interface SpecialistCardProps {
  specialist: AISpecialist;
  onClick?: () => void;
  showDetails?: boolean;
  className?: string;
}

// Theme types
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
  };
}