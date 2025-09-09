import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Brain, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ADRTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

interface ADRCreatorProps {
  onSave: (adr: any) => void;
  onCancel: () => void;
}

export const ADRCreator: React.FC<ADRCreatorProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'proposed',
    context: '',
    decision: '',
    consequences: '',
    alternatives: '',
    component: ''
  });

  const [templates] = useState<ADRTemplate[]>([
    {
      id: 'basic',
      name: 'Basic ADR',
      description: 'Standard architectural decision record',
      template: `# Context\n\n# Decision\n\n# Consequences\n\n# Alternatives Considered`
    },
    {
      id: 'technical',
      name: 'Technical Decision',
      description: 'For technical architecture decisions',
      template: `# Problem Statement\n\n# Decision\n\n# Technical Rationale\n\n# Implementation Notes\n\n# Risks and Mitigations`
    },
    {
      id: 'strategic',
      name: 'Strategic Decision',
      description: 'For high-level strategic decisions',
      template: `# Strategic Context\n\n# Decision\n\n# Business Impact\n\n# Success Metrics\n\n# Review Timeline`
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      // Parse template into form fields
      const sections = template.template.split('\n\n');
      setFormData(prev => ({
        ...prev,
        context: sections.find(s => s.startsWith('# Context')) || '',
        decision: sections.find(s => s.startsWith('# Decision')) || '',
        consequences: sections.find(s => s.startsWith('# Consequences')) || ''
      }));
    }
  };

  const generateAiSuggestions = async (context: string) => {
    if (context.length > 50) {
      // Simulate AI suggestions based on context
      const suggestions = [
        "Consider performance implications of this architectural choice",
        "Evaluate long-term maintenance costs",
        "Document rollback procedures",
        "Define success metrics for this decision"
      ];
      setAiSuggestions(suggestions);
    }
  };

  const handleSave = () => {
    const adr = {
      ...formData,
      id: `ADR-${Date.now()}`,
      created: new Date().toISOString(),
      template: selectedTemplate
    };
    onSave(adr);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Create New ADR</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Template</label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Use PostgreSQL for primary database"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Component/System</label>
              <Input
                value={formData.component}
                onChange={(e) => setFormData(prev => ({ ...prev, component: e.target.value }))}
                placeholder="e.g., data-layer, api, frontend"
                className="w-full"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proposed">Proposed</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="superseded">Superseded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Context</label>
              <Textarea
                value={formData.context}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, context: e.target.value }));
                  generateAiSuggestions(e.target.value);
                }}
                placeholder="What is the context of this decision? What forces are at play?"
                className="min-h-32"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Decision</label>
              <Textarea
                value={formData.decision}
                onChange={(e) => setFormData(prev => ({ ...prev, decision: e.target.value }))}
                placeholder="What is the decision being made?"
                className="min-h-24"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Consequences</label>
              <Textarea
                value={formData.consequences}
                onChange={(e) => setFormData(prev => ({ ...prev, consequences: e.target.value }))}
                placeholder="What are the consequences of this decision?"
                className="min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Alternatives Considered</label>
              <Textarea
                value={formData.alternatives}
                onChange={(e) => setFormData(prev => ({ ...prev, alternatives: e.target.value }))}
                placeholder="What other options were considered and why were they rejected?"
                className="min-h-24"
              />
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium text-purple-900">AI Assistant</h3>
            </div>
            
            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-purple-700 mb-2">Suggestions:</p>
                {aiSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-2 bg-white/60 rounded text-sm text-purple-800 cursor-pointer hover:bg-white/80"
                    onClick={() => {
                      // Add suggestion to current field
                      setFormData(prev => ({
                        ...prev,
                        consequences: prev.consequences + (prev.consequences ? '\n\n' : '') + `• ${suggestion}`
                      }));
                    }}
                  >
                    <Target className="h-3 w-3 inline mr-1" />
                    {suggestion}
                  </motion.div>
                ))}
              </div>
            )}
            
            {aiSuggestions.length === 0 && (
              <p className="text-sm text-purple-600">
                Start filling in the context to get AI-powered suggestions for your ADR.
              </p>
            )}
          </motion.div>

          {/* Template Preview */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-50 p-4 rounded-lg border"
            >
              <h3 className="font-medium text-gray-900 mb-2">Template Structure</h3>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {templates.find(t => t.id === selectedTemplate)?.template}
              </pre>
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!formData.title || !formData.decision}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create ADR
        </Button>
      </div>
    </motion.div>
  );
};