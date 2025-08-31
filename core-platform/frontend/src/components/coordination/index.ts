// Layout Components
export { CoordinationLayout } from './layout/CoordinationLayout';
export { CoordinationSidebar } from './layout/CoordinationSidebar';

// UI Components  
export { CoordinationCard } from './ui/CoordinationCard';
export { CoordinationButton } from './ui/CoordinationButton';
export { StatusBadge } from './ui/StatusBadge';

// AI Components
export { SpecialistCard } from './ai/SpecialistCard';
export { CommunicationFeed } from './ai/CommunicationFeed';

// Dashboard Components
export { AITeamCoordinationHub } from './dashboard/AITeamCoordinationHub';

// Context and Hooks
export { CoordinationThemeProvider, useCoordinationTheme } from '../../contexts/CoordinationThemeContext';
export { useWebSocketConnection } from '../../hooks/useWebSocketConnection';

// Types
export type * from '../../types/coordination.types';