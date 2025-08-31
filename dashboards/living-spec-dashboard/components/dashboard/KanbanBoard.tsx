'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, User, Calendar, Tag } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  tags?: string[];
  dueDate?: string;
  estimate?: number;
}

interface KanbanBoardProps {
  tasks: Task[];
  title?: string;
  className?: string;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-50 border-gray-200' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'review', title: 'Review', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' },
] as const;

export function KanbanBoard({ tasks, title = "Task Board", className = "" }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = Array.from(
    new Set(tasks.flatMap(task => task.tags || []))
  ).sort();

  // Filter tasks based on search and tag filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || task.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter(task => task.status === status);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📋</span>
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          Task management and progress tracking
        </CardDescription>
        
        {/* Search and Filter Controls */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                !selectedTag 
                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              All Tags
            </button>
            {allTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className={`rounded-lg border-2 p-4 ${column.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {column.title}
                  </h3>
                  <Badge variant="outline" size="sm">
                    {columnTasks.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {columnTasks.map(task => (
                    <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Title and Priority */}
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                              {task.title}
                            </h4>
                            {task.priority && (
                              <Badge size="sm" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Description */}
                          {task.description && (
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" size="sm" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <Badge variant="outline" size="sm" className="text-xs">
                                  +{task.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Meta info */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              {task.assignee && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{task.assignee}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {task.estimate && (
                                <span>{task.estimate}h</span>
                              )}
                              {task.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredTasks.length} of {tasks.length} tasks
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedTag && ` tagged with "${selectedTag}"`}
            </span>
            
            <div className="flex items-center space-x-4">
              <span>Completion: {Math.round((getTasksByStatus('done').length / filteredTasks.length) * 100) || 0}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}