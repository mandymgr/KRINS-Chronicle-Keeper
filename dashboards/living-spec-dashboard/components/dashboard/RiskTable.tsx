'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'business' | 'resource' | 'external';
  probability: number; // 1-5
  impact: number; // 1-5
  owner: string;
  status: 'identified' | 'mitigating' | 'monitoring' | 'resolved';
  mitigation?: string;
  contingency?: string;
  identifiedDate: string;
  lastReviewed: string;
}

interface RiskTableProps {
  risks: Risk[];
  title?: string;
  className?: string;
}

const categoryColors = {
  technical: 'bg-blue-100 text-blue-800 border-blue-200',
  business: 'bg-green-100 text-green-800 border-green-200',
  resource: 'bg-purple-100 text-purple-800 border-purple-200',
  external: 'bg-orange-100 text-orange-800 border-orange-200',
} as const;

const statusColors = {
  identified: 'bg-red-100 text-red-800 border-red-200',
  mitigating: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  monitoring: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
} as const;

const statusIcons = {
  identified: <AlertTriangle className="w-4 h-4" />,
  mitigating: <Shield className="w-4 h-4" />,
  monitoring: <Clock className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
} as const;

export function RiskTable({ risks, title = "Risk Management", className = "" }: RiskTableProps) {
  const getRiskScore = (probability: number, impact: number) => probability * impact;
  
  const getRiskLevel = (score: number) => {
    if (score >= 20) return { level: 'Critical', color: 'text-red-800 bg-red-100' };
    if (score >= 15) return { level: 'High', color: 'text-red-700 bg-red-50' };
    if (score >= 10) return { level: 'Medium', color: 'text-yellow-700 bg-yellow-50' };
    if (score >= 5) return { level: 'Low', color: 'text-green-700 bg-green-50' };
    return { level: 'Very Low', color: 'text-green-600 bg-green-50' };
  };

  // Risk matrix visualization data
  const matrixData = Array.from({ length: 5 }, (_, impact) => 
    Array.from({ length: 5 }, (_, probability) => {
      const score = (impact + 1) * (probability + 1);
      const level = getRiskLevel(score);
      const riskCount = risks.filter(r => 
        Math.round(r.impact) === impact + 1 && Math.round(r.probability) === probability + 1
      ).length;
      
      return { impact: impact + 1, probability: probability + 1, score, level, count: riskCount };
    })
  ).reverse(); // Reverse to show high impact at top

  const sortedRisks = [...risks].sort((a, b) => {
    const scoreA = getRiskScore(a.probability, a.impact);
    const scoreB = getRiskScore(b.probability, b.impact);
    return scoreB - scoreA; // High risk first
  });

  const riskStats = {
    total: risks.length,
    critical: risks.filter(r => getRiskScore(r.probability, r.impact) >= 20).length,
    high: risks.filter(r => {
      const score = getRiskScore(r.probability, r.impact);
      return score >= 15 && score < 20;
    }).length,
    medium: risks.filter(r => {
      const score = getRiskScore(r.probability, r.impact);
      return score >= 10 && score < 15;
    }).length,
    resolved: risks.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            Project risk assessment and mitigation tracking
          </CardDescription>
          
          {/* Risk Statistics */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>{riskStats.critical} Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>{riskStats.high} High</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>{riskStats.medium} Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>{riskStats.resolved} Resolved</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Matrix</CardTitle>
            <CardDescription>
              Probability vs Impact visualization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Headers */}
              <div className="grid grid-cols-6 gap-1 text-xs text-center font-medium">
                <div></div>
                <div>Very Low</div>
                <div>Low</div>
                <div>Medium</div>
                <div>High</div>
                <div>Very High</div>
              </div>
              
              {/* Matrix rows */}
              {matrixData.map((row, impactIdx) => (
                <div key={impactIdx} className="grid grid-cols-6 gap-1">
                  <div className="text-xs font-medium p-2 text-right">
                    {impactIdx === 0 && 'Very High'}
                    {impactIdx === 1 && 'High'}
                    {impactIdx === 2 && 'Medium'}
                    {impactIdx === 3 && 'Low'}
                    {impactIdx === 4 && 'Very Low'}
                  </div>
                  {row.map((cell, probIdx) => (
                    <div
                      key={probIdx}
                      className={`h-12 rounded border flex items-center justify-center text-xs font-medium ${
                        cell.score >= 20 ? 'bg-red-200 border-red-300 text-red-800' :
                        cell.score >= 15 ? 'bg-orange-200 border-orange-300 text-orange-800' :
                        cell.score >= 10 ? 'bg-yellow-200 border-yellow-300 text-yellow-800' :
                        cell.score >= 5 ? 'bg-green-200 border-green-300 text-green-800' :
                        'bg-green-100 border-green-200 text-green-700'
                      }`}
                      title={`${cell.count} risks - Score: ${cell.score}`}
                    >
                      {cell.count > 0 && cell.count}
                    </div>
                  ))}
                </div>
              ))}
              
              <div className="text-center text-xs text-gray-600 mt-2">
                <div>← Probability →</div>
                <div className="transform rotate-90 origin-center absolute left-0 top-1/2">
                  Impact
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Risks List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Risks</CardTitle>
            <CardDescription>
              Highest priority risks requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedRisks.slice(0, 10).map((risk) => {
                const score = getRiskScore(risk.probability, risk.impact);
                const level = getRiskLevel(score);
                
                return (
                  <div key={risk.id} className="p-3 rounded-lg border bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {risk.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-2">
                        <Badge size="sm" className={level.color}>
                          {level.level}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {score}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {risk.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <Badge size="sm" className={categoryColors[risk.category]}>
                          {risk.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          {statusIcons[risk.status]}
                          <Badge size="sm" className={statusColors[risk.status]}>
                            {risk.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-gray-500">
                        {risk.owner}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Risks</CardTitle>
          <CardDescription>
            Complete risk register with mitigation details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold">Risk</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-center p-3 font-semibold">P</th>
                  <th className="text-center p-3 font-semibold">I</th>
                  <th className="text-center p-3 font-semibold">Score</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Owner</th>
                  <th className="text-left p-3 font-semibold">Last Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {sortedRisks.map((risk) => {
                  const score = getRiskScore(risk.probability, risk.impact);
                  const level = getRiskLevel(score);
                  
                  return (
                    <tr key={risk.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {risk.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                            {risk.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge size="sm" className={categoryColors[risk.category]}>
                          {risk.category}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{risk.probability}</td>
                      <td className="p-3 text-center">{risk.impact}</td>
                      <td className="p-3 text-center">
                        <Badge size="sm" className={level.color}>
                          {score}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          {statusIcons[risk.status]}
                          <Badge size="sm" className={statusColors[risk.status]}>
                            {risk.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{risk.owner}</td>
                      <td className="p-3 text-gray-600">
                        {formatDate(risk.lastReviewed)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}