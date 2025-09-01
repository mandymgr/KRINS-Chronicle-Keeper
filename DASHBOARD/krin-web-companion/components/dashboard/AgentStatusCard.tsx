import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AgentInfo {
  id: string
  name: string
  role: string
  status: 'active' | 'inactive' | 'processing' | 'error'
  lastActivity?: string
  tasksCompleted?: number
  currentTask?: string
}

interface AgentStatusCardProps {
  agent: AgentInfo
  className?: string
}

const statusConfig = {
  active: {
    color: 'agent-status-active',
    bgColor: 'bg-ai-active/10',
    label: 'Aktiv'
  },
  inactive: {
    color: 'agent-status-inactive',
    bgColor: 'bg-stone-100',
    label: 'Inaktiv'
  },
  processing: {
    color: 'agent-status-processing',
    bgColor: 'bg-ai-processing/10',
    label: 'Prosesserer'
  },
  error: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    label: 'Feil'
  }
}

export default function AgentStatusCard({ agent, className }: AgentStatusCardProps) {
  const status = statusConfig[agent.status]

  return (
    <Card className={cn('relative', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{agent.name}</CardTitle>
            <CardDescription>{agent.role}</CardDescription>
          </div>
          
          <div className={cn('px-2 py-1 rounded-md text-xs font-medium', status.bgColor)}>
            <span className={status.color}>
              ●
            </span>
            <span className="ml-1">
              {status.label}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {agent.currentTask && (
          <div className="mb-4">
            <div className="kicker mb-1">Nåværende oppgave</div>
            <p className="text-sm text-ink">
              {agent.currentTask}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {agent.tasksCompleted !== undefined && (
            <div>
              <div className="kicker mb-1">Oppgaver fullført</div>
              <div className="font-medium text-ink">
                {agent.tasksCompleted}
              </div>
            </div>
          )}
          
          {agent.lastActivity && (
            <div>
              <div className="kicker mb-1">Siste aktivitet</div>
              <div className="font-medium text-ink">
                {agent.lastActivity}
              </div>
            </div>
          )}
        </div>

        {agent.status === 'processing' && (
          <div className="mt-4">
            <div className="w-full bg-stone-200 rounded-full h-1">
              <div 
                className="bg-ai-processing h-1 rounded-full loading-pulse" 
                style={{ width: '60%' }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}