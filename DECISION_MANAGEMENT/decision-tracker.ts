#!/usr/bin/env bun
/**
 * 📋 Decision Tracker - Advanced ADR Management System
 * 
 * Comprehensive decision tracking, linking, and evidence collection
 * for KRINS-Chronicle-Keeper
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

export interface ADR {
  id: string;
  number: number;
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated' | 'superseded';
  date: Date;
  author: string;
  component: string;
  problem: string;
  decision: string;
  rationale: string;
  consequences: {
    positive: string[];
    negative: string[];
    risks: string[];
  };
  alternatives: string[];
  evidence: Evidence[];
  linkedDecisions: string[];
  supersedes?: string[];
  supersededBy?: string;
  tags: string[];
  reviewDate?: Date;
  implementationStatus: 'planned' | 'in_progress' | 'completed' | 'failed';
  metadata: {
    filePath: string;
    lastModified: Date;
    size: number;
    complexity: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface Evidence {
  id: string;
  type: 'metric' | 'feedback' | 'incident' | 'performance' | 'cost' | 'survey';
  description: string;
  value: string | number;
  unit?: string;
  date: Date;
  source: string;
  confidence: number; // 0-100
  trend: 'improving' | 'stable' | 'degrading' | 'unknown';
}

export interface DecisionLink {
  fromADR: string;
  toADR: string;
  relationship: 'depends_on' | 'conflicts_with' | 'supports' | 'supersedes' | 'related_to';
  description: string;
  strength: 'weak' | 'medium' | 'strong';
}

export class DecisionTracker {
  private adrDirectory: string;
  private adrs: Map<string, ADR> = new Map();
  private links: DecisionLink[] = [];

  constructor(chronicleKeeperPath: string = process.cwd()) {
    this.adrDirectory = join(chronicleKeeperPath, 'docs', 'adr');
    this.loadADRs();
    this.loadLinks();
  }

  /**
   * 📋 Load all ADRs from the adr directory
   */
  private loadADRs(): void {
    if (!existsSync(this.adrDirectory)) {
      console.warn(`ADR directory not found: ${this.adrDirectory}`);
      return;
    }

    const adrFiles = readdirSync(this.adrDirectory)
      .filter(file => file.match(/^ADR-\d{4}-.+\.md$/))
      .sort();

    for (const file of adrFiles) {
      try {
        const adr = this.parseADR(join(this.adrDirectory, file));
        if (adr) {
          this.adrs.set(adr.id, adr);
        }
      } catch (error) {
        console.error(`Error parsing ADR ${file}:`, error);
      }
    }

    console.log(`📋 Loaded ${this.adrs.size} ADRs`);
  }

  /**
   * 📝 Parse ADR file into structured format
   */
  private parseADR(filePath: string): ADR | null {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Extract basic info from filename and header
    const filename = filePath.split('/').pop() || '';
    const match = filename.match(/^ADR-(\d{4})-(.+)\.md$/);
    if (!match) return null;

    const number = parseInt(match[1]);
    const titleFromFile = match[2].replace(/-/g, ' ');

    // Parse markdown content
    const sections = this.parseMarkdownSections(content);
    
    const adr: ADR = {
      id: `ADR-${String(number).padStart(4, '0')}`,
      number,
      title: sections.title || titleFromFile,
      status: this.extractStatus(content),
      date: this.extractDate(content),
      author: this.extractAuthor(content),
      component: this.extractComponent(content),
      problem: sections.context || sections.problem || '',
      decision: sections.decision || '',
      rationale: sections.rationale || '',
      consequences: this.extractConsequences(content),
      alternatives: this.extractAlternatives(content),
      evidence: this.extractEvidence(content),
      linkedDecisions: this.extractLinkedDecisions(content),
      tags: this.extractTags(content),
      implementationStatus: this.extractImplementationStatus(content),
      metadata: {
        filePath,
        lastModified: new Date(),
        size: content.length,
        complexity: this.assessComplexity(content),
        impact: this.assessImpact(content)
      }
    };

    return adr;
  }

  /**
   * 📊 Parse markdown sections
   */
  private parseMarkdownSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.startsWith('# ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = 'title';
        currentContent = [line.substring(2)];
      } else if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.substring(3).toLowerCase().replace(/\s+/g, '_');
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * 🏷️ Extract status from ADR content
   */
  private extractStatus(content: string): ADR['status'] {
    const statusMatch = content.match(/Status:\s*(proposed|accepted|rejected|deprecated|superseded)/i);
    return statusMatch ? statusMatch[1].toLowerCase() as ADR['status'] : 'proposed';
  }

  /**
   * 📅 Extract date from ADR content
   */
  private extractDate(content: string): Date {
    const dateMatch = content.match(/Date:\s*(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? new Date(dateMatch[1]) : new Date();
  }

  /**
   * 👤 Extract author from ADR content
   */
  private extractAuthor(content: string): string {
    const authorMatch = content.match(/Author:\s*(.+)/);
    return authorMatch ? authorMatch[1].trim() : 'Unknown';
  }

  /**
   * 🏗️ Extract component from ADR content
   */
  private extractComponent(content: string): string {
    const componentMatch = content.match(/Component:\s*(.+)/);
    return componentMatch ? componentMatch[1].trim() : 'General';
  }

  /**
   * ⚡ Extract consequences from ADR content
   */
  private extractConsequences(content: string): ADR['consequences'] {
    return {
      positive: this.extractListItems(content, /### Positive Consequences([\s\S]*?)(?=###|$)/),
      negative: this.extractListItems(content, /### Negative Consequences([\s\S]*?)(?=###|$)/),
      risks: this.extractListItems(content, /### Risks([\s\S]*?)(?=###|$)/)
    };
  }

  /**
   * 📋 Extract list items from text
   */
  private extractListItems(content: string, regex: RegExp): string[] {
    const match = content.match(regex);
    if (!match) return [];

    return match[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim())
      .filter(item => item.length > 0);
  }

  /**
   * 🔄 Extract alternatives from ADR content
   */
  private extractAlternatives(content: string): string[] {
    return this.extractListItems(content, /### Alternatives Considered([\s\S]*?)(?=###|$)/);
  }

  /**
   * 📊 Extract evidence from ADR content
   */
  private extractEvidence(content: string): Evidence[] {
    const evidence: Evidence[] = [];
    const evidenceMatch = content.match(/### Evidence([\s\S]*?)(?=###|$)/);
    
    if (evidenceMatch) {
      const lines = evidenceMatch[1].split('\n');
      for (const line of lines) {
        const metric = line.match(/- (.+): (.+) \((.+)\)/);
        if (metric) {
          evidence.push({
            id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'metric',
            description: metric[1],
            value: metric[2],
            date: new Date(),
            source: metric[3],
            confidence: 80,
            trend: 'unknown'
          });
        }
      }
    }

    return evidence;
  }

  /**
   * 🔗 Extract linked decisions from ADR content
   */
  private extractLinkedDecisions(content: string): string[] {
    const links: string[] = [];
    const linkMatches = content.matchAll(/ADR-(\d{4})/g);
    
    for (const match of linkMatches) {
      const adrId = `ADR-${match[1]}`;
      if (!links.includes(adrId)) {
        links.push(adrId);
      }
    }

    return links;
  }

  /**
   * 🏷️ Extract tags from ADR content
   */
  private extractTags(content: string): string[] {
    const tagsMatch = content.match(/Tags:\s*(.+)/);
    return tagsMatch 
      ? tagsMatch[1].split(',').map(tag => tag.trim())
      : [];
  }

  /**
   * 🚧 Extract implementation status
   */
  private extractImplementationStatus(content: string): ADR['implementationStatus'] {
    const statusMatch = content.match(/Implementation:\s*(planned|in_progress|completed|failed)/i);
    return statusMatch ? statusMatch[1].toLowerCase() as ADR['implementationStatus'] : 'planned';
  }

  /**
   * 🧮 Assess complexity of decision
   */
  private assessComplexity(content: string): ADR['metadata']['complexity'] {
    const wordCount = content.split(/\s+/).length;
    const sectionCount = (content.match(/^##/gm) || []).length;
    
    if (wordCount > 1000 || sectionCount > 8) return 'high';
    if (wordCount > 500 || sectionCount > 5) return 'medium';
    return 'low';
  }

  /**
   * 💥 Assess impact of decision
   */
  private assessImpact(content: string): ADR['metadata']['impact'] {
    const highImpactKeywords = ['architecture', 'security', 'performance', 'database', 'framework'];
    const criticalKeywords = ['breaking', 'migration', 'legacy', 'deprecated'];
    
    const lowerContent = content.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerContent.includes(keyword))) return 'critical';
    if (highImpactKeywords.some(keyword => lowerContent.includes(keyword))) return 'high';
    
    return 'medium';
  }

  /**
   * 🔗 Load decision links
   */
  private loadLinks(): void {
    // For now, derive links from ADR content
    // In future, could be stored in separate file
    for (const adr of this.adrs.values()) {
      for (const linkedId of adr.linkedDecisions) {
        if (linkedId !== adr.id && this.adrs.has(linkedId)) {
          this.links.push({
            fromADR: adr.id,
            toADR: linkedId,
            relationship: 'related_to',
            description: `Referenced in ${adr.id}`,
            strength: 'medium'
          });
        }
      }
    }
  }

  /**
   * 📊 Get decision analytics
   */
  getAnalytics(): {
    total: number;
    byStatus: Record<string, number>;
    byComponent: Record<string, number>;
    byImpact: Record<string, number>;
    implementationProgress: Record<string, number>;
    recentDecisions: ADR[];
    mostLinked: ADR[];
  } {
    const analytics = {
      total: this.adrs.size,
      byStatus: {} as Record<string, number>,
      byComponent: {} as Record<string, number>,
      byImpact: {} as Record<string, number>,
      implementationProgress: {} as Record<string, number>,
      recentDecisions: [] as ADR[],
      mostLinked: [] as ADR[]
    };

    for (const adr of this.adrs.values()) {
      // Count by status
      analytics.byStatus[adr.status] = (analytics.byStatus[adr.status] || 0) + 1;
      
      // Count by component
      analytics.byComponent[adr.component] = (analytics.byComponent[adr.component] || 0) + 1;
      
      // Count by impact
      analytics.byImpact[adr.metadata.impact] = (analytics.byImpact[adr.metadata.impact] || 0) + 1;
      
      // Count implementation progress
      analytics.implementationProgress[adr.implementationStatus] = 
        (analytics.implementationProgress[adr.implementationStatus] || 0) + 1;
    }

    // Recent decisions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    analytics.recentDecisions = Array.from(this.adrs.values())
      .filter(adr => adr.date >= thirtyDaysAgo)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    // Most linked decisions
    const linkCounts = new Map<string, number>();
    for (const link of this.links) {
      linkCounts.set(link.toADR, (linkCounts.get(link.toADR) || 0) + 1);
    }

    analytics.mostLinked = Array.from(this.adrs.values())
      .sort((a, b) => (linkCounts.get(b.id) || 0) - (linkCounts.get(a.id) || 0))
      .slice(0, 10);

    return analytics;
  }

  /**
   * 🔍 Search ADRs
   */
  searchADRs(query: string, filters?: {
    status?: string[];
    component?: string[];
    impact?: string[];
    tags?: string[];
  }): ADR[] {
    const results: ADR[] = [];
    const queryLower = query.toLowerCase();

    for (const adr of this.adrs.values()) {
      // Apply filters
      if (filters?.status && !filters.status.includes(adr.status)) continue;
      if (filters?.component && !filters.component.includes(adr.component)) continue;
      if (filters?.impact && !filters.impact.includes(adr.metadata.impact)) continue;
      if (filters?.tags && !filters.tags.some(tag => adr.tags.includes(tag))) continue;

      // Text search
      const searchText = `${adr.title} ${adr.problem} ${adr.decision} ${adr.rationale}`.toLowerCase();
      if (searchText.includes(queryLower)) {
        results.push(adr);
      }
    }

    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * 📋 Get ADR by ID
   */
  getADR(id: string): ADR | undefined {
    return this.adrs.get(id);
  }

  /**
   * 📋 Get all ADRs
   */
  getAllADRs(): ADR[] {
    return Array.from(this.adrs.values())
      .sort((a, b) => a.number - b.number);
  }

  /**
   * 🔗 Get decision links for ADR
   */
  getLinksForADR(adrId: string): DecisionLink[] {
    return this.links.filter(link => 
      link.fromADR === adrId || link.toADR === adrId
    );
  }

  /**
   * 📊 Add evidence to ADR
   */
  addEvidence(adrId: string, evidence: Omit<Evidence, 'id'>): boolean {
    const adr = this.adrs.get(adrId);
    if (!adr) return false;

    const newEvidence: Evidence = {
      ...evidence,
      id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    adr.evidence.push(newEvidence);
    return true;
  }

  /**
   * 📈 Generate decision report
   */
  generateReport(format: 'json' | 'markdown' = 'json'): string {
    const analytics = this.getAnalytics();
    
    if (format === 'markdown') {
      return this.generateMarkdownReport(analytics);
    }

    return JSON.stringify(analytics, null, 2);
  }

  /**
   * 📝 Generate markdown report
   */
  private generateMarkdownReport(analytics: ReturnType<typeof this.getAnalytics>): string {
    return `# 📋 Decision Management Report

## 📊 Overview
- **Total Decisions:** ${analytics.total}
- **Report Generated:** ${new Date().toISOString().split('T')[0]}

## 🏷️ Status Distribution
${Object.entries(analytics.byStatus)
  .map(([status, count]) => `- **${status}:** ${count}`)
  .join('\n')}

## 🏗️ Component Distribution
${Object.entries(analytics.byComponent)
  .map(([component, count]) => `- **${component}:** ${count}`)
  .join('\n')}

## 💥 Impact Distribution
${Object.entries(analytics.byImpact)
  .map(([impact, count]) => `- **${impact}:** ${count}`)
  .join('\n')}

## 🚧 Implementation Progress
${Object.entries(analytics.implementationProgress)
  .map(([status, count]) => `- **${status}:** ${count}`)
  .join('\n')}

## 🕐 Recent Decisions (Last 30 Days)
${analytics.recentDecisions
  .map(adr => `- **${adr.id}:** ${adr.title} (${adr.date.toISOString().split('T')[0]})`)
  .join('\n')}

## 🔗 Most Referenced Decisions
${analytics.mostLinked
  .map(adr => `- **${adr.id}:** ${adr.title}`)
  .join('\n')}

---
*Generated by KRINS-Chronicle-Keeper Decision Tracker*
`;
  }
}

// CLI interface when run directly
if (import.meta.main) {
  const tracker = new DecisionTracker();
  
  const command = Bun.argv[2];
  
  switch (command) {
    case 'analytics':
      console.log(tracker.generateReport('json'));
      break;
      
    case 'report':
      console.log(tracker.generateReport('markdown'));
      break;
      
    case 'search':
      const query = Bun.argv[3] || '';
      const results = tracker.searchADRs(query);
      console.log(`Found ${results.length} ADRs matching "${query}"`);
      results.slice(0, 10).forEach(adr => {
        console.log(`- ${adr.id}: ${adr.title}`);
      });
      break;
      
    case 'list':
      const all = tracker.getAllADRs();
      console.log(`📋 ${all.length} ADRs found:`);
      all.forEach(adr => {
        console.log(`- ${adr.id}: ${adr.title} (${adr.status})`);
      });
      break;
      
    default:
      console.log(`
📋 KRINS Decision Tracker

Usage: bun decision-tracker.ts <command>

Commands:
  analytics     Show decision analytics as JSON
  report        Generate markdown report
  search <query> Search ADRs by text
  list          List all ADRs

Examples:
  bun decision-tracker.ts analytics
  bun decision-tracker.ts search "database"
  bun decision-tracker.ts report > decision-report.md
      `);
  }
}