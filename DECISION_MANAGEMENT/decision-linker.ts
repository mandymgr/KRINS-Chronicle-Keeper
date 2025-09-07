#!/usr/bin/env bun
/**
 * 🔗 Decision Linker - ADR Relationship Management System
 * 
 * Advanced linking system for connecting related architectural decisions
 * with impact analysis and dependency tracking
 */

import { DecisionTracker, ADR, DecisionLink } from './decision-tracker';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface LinkSuggestion {
  fromADR: string;
  toADR: string;
  confidence: number; // 0-100
  reason: string;
  suggestedRelationship: DecisionLink['relationship'];
  textualEvidence: string[];
}

export interface DependencyGraph {
  nodes: {
    id: string;
    title: string;
    status: ADR['status'];
    impact: ADR['metadata']['impact'];
    component: string;
  }[];
  edges: {
    from: string;
    to: string;
    relationship: DecisionLink['relationship'];
    strength: DecisionLink['strength'];
  }[];
  clusters: {
    id: string;
    name: string;
    nodes: string[];
    centralNode?: string;
  }[];
}

export interface ImpactAnalysis {
  adrId: string;
  directImpacts: string[]; // ADRs directly affected
  cascadeImpacts: string[]; // ADRs affected through chain
  riskScore: number; // 0-100
  changeComplexity: 'low' | 'medium' | 'high' | 'critical';
  affectedComponents: string[];
  recommendedActions: string[];
}

export class DecisionLinker {
  private tracker: DecisionTracker;
  private linksFile: string;
  private customLinks: Map<string, DecisionLink[]> = new Map();

  constructor(chronicleKeeperPath: string = process.cwd()) {
    this.tracker = new DecisionTracker(chronicleKeeperPath);
    this.linksFile = join(chronicleKeeperPath, 'DECISION_MANAGEMENT', 'decision-links.json');
    this.loadCustomLinks();
  }

  /**
   * 🔗 Load custom links from file
   */
  private loadCustomLinks(): void {
    if (existsSync(this.linksFile)) {
      try {
        const data = JSON.parse(readFileSync(this.linksFile, 'utf-8'));
        for (const [adrId, links] of Object.entries(data)) {
          this.customLinks.set(adrId, links as DecisionLink[]);
        }
        console.log(`🔗 Loaded custom links for ${this.customLinks.size} ADRs`);
      } catch (error) {
        console.error('Error loading custom links:', error);
      }
    }
  }

  /**
   * 💾 Save custom links to file
   */
  private saveCustomLinks(): void {
    const data: Record<string, DecisionLink[]> = {};
    for (const [adrId, links] of this.customLinks) {
      data[adrId] = links;
    }
    
    writeFileSync(this.linksFile, JSON.stringify(data, null, 2));
    console.log(`💾 Saved links for ${Object.keys(data).length} ADRs`);
  }

  /**
   * 🔍 Suggest links between ADRs using NLP and pattern matching
   */
  suggestLinks(adrId?: string): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];
    const adrs = adrId ? [this.tracker.getADR(adrId)].filter(Boolean) : this.tracker.getAllADRs();
    const allADRs = this.tracker.getAllADRs();

    for (const adr of adrs) {
      if (!adr) continue;

      for (const otherADR of allADRs) {
        if (adr.id === otherADR.id) continue;

        const suggestion = this.analyzePotentialLink(adr, otherADR);
        if (suggestion && suggestion.confidence > 30) {
          suggestions.push(suggestion);
        }
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 🧠 Analyze potential link between two ADRs
   */
  private analyzePotentialLink(adr1: ADR, adr2: ADR): LinkSuggestion | null {
    const evidence: string[] = [];
    let confidence = 0;
    let relationship: DecisionLink['relationship'] = 'related_to';

    // Component similarity
    if (adr1.component === adr2.component) {
      confidence += 20;
      evidence.push(`Same component: ${adr1.component}`);
    }

    // Keyword overlap analysis
    const keywords1 = this.extractKeywords(adr1);
    const keywords2 = this.extractKeywords(adr2);
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    
    if (commonKeywords.length > 0) {
      confidence += Math.min(commonKeywords.length * 10, 30);
      evidence.push(`Common keywords: ${commonKeywords.join(', ')}`);
    }

    // Technology stack analysis
    const tech1 = this.extractTechnology(adr1);
    const tech2 = this.extractTechnology(adr2);
    const commonTech = tech1.filter(t => tech2.includes(t));
    
    if (commonTech.length > 0) {
      confidence += Math.min(commonTech.length * 15, 25);
      evidence.push(`Common technology: ${commonTech.join(', ')}`);
    }

    // Temporal relationship
    const timeDiff = Math.abs(adr1.date.getTime() - adr2.date.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 30) {
      confidence += 15;
      evidence.push(`Created within 30 days of each other`);
    }

    // Status dependency analysis
    if (adr1.status === 'superseded' && adr2.status === 'accepted') {
      confidence += 25;
      relationship = 'supersedes';
      evidence.push(`Potential supersession relationship`);
    } else if (adr1.status === 'rejected' && adr2.status === 'accepted') {
      confidence += 20;
      relationship = 'conflicts_with';
      evidence.push(`Potential conflict - one rejected, other accepted`);
    }

    // Direct reference analysis
    const content1 = `${adr1.problem} ${adr1.decision} ${adr1.rationale}`.toLowerCase();
    const content2 = `${adr2.problem} ${adr2.decision} ${adr2.rationale}`.toLowerCase();
    
    if (content1.includes(adr2.id.toLowerCase()) || content2.includes(adr1.id.toLowerCase())) {
      confidence += 40;
      relationship = 'depends_on';
      evidence.push(`Direct reference found`);
    }

    // Problem domain similarity
    const problemSimilarity = this.calculateTextSimilarity(adr1.problem, adr2.problem);
    if (problemSimilarity > 0.3) {
      confidence += Math.floor(problemSimilarity * 20);
      evidence.push(`Similar problem domains (${Math.floor(problemSimilarity * 100)}% similarity)`);
    }

    // Solution approach similarity
    const decisionSimilarity = this.calculateTextSimilarity(adr1.decision, adr2.decision);
    if (decisionSimilarity > 0.3) {
      confidence += Math.floor(decisionSimilarity * 15);
      evidence.push(`Similar solutions (${Math.floor(decisionSimilarity * 100)}% similarity)`);
    }

    if (confidence < 10) return null;

    return {
      fromADR: adr1.id,
      toADR: adr2.id,
      confidence: Math.min(confidence, 100),
      reason: evidence.join('; '),
      suggestedRelationship: relationship,
      textualEvidence: evidence
    };
  }

  /**
   * 🔤 Extract keywords from ADR
   */
  private extractKeywords(adr: ADR): string[] {
    const text = `${adr.title} ${adr.problem} ${adr.decision}`.toLowerCase();
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'will', 'would', 'should', 'could'];
    
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // unique
      .slice(0, 20); // top 20
  }

  /**
   * 💻 Extract technology terms from ADR
   */
  private extractTechnology(adr: ADR): string[] {
    const techTerms = [
      'react', 'vue', 'angular', 'typescript', 'javascript', 'python', 'java', 'kotlin',
      'docker', 'kubernetes', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'vercel', 'netlify', 'github', 'gitlab',
      'graphql', 'rest', 'api', 'microservices', 'serverless', 'lambda',
      'tensorflow', 'pytorch', 'machine learning', 'ai', 'blockchain', 'quantum'
    ];
    
    const text = `${adr.title} ${adr.problem} ${adr.decision}`.toLowerCase();
    return techTerms.filter(term => text.includes(term));
  }

  /**
   * 📊 Calculate text similarity using simple word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const intersection = words1.filter(w => words2.includes(w));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * 🔗 Add custom link between ADRs
   */
  addLink(fromADR: string, toADR: string, relationship: DecisionLink['relationship'], description: string, strength: DecisionLink['strength'] = 'medium'): boolean {
    const from = this.tracker.getADR(fromADR);
    const to = this.tracker.getADR(toADR);
    
    if (!from || !to) {
      console.error(`ADR not found: ${fromADR} or ${toADR}`);
      return false;
    }

    const link: DecisionLink = {
      fromADR,
      toADR,
      relationship,
      description,
      strength
    };

    if (!this.customLinks.has(fromADR)) {
      this.customLinks.set(fromADR, []);
    }

    const existing = this.customLinks.get(fromADR)!;
    const existingIndex = existing.findIndex(l => l.toADR === toADR && l.relationship === relationship);
    
    if (existingIndex >= 0) {
      existing[existingIndex] = link;
    } else {
      existing.push(link);
    }

    this.saveCustomLinks();
    console.log(`🔗 Added link: ${fromADR} ${relationship} ${toADR}`);
    return true;
  }

  /**
   * 📊 Generate dependency graph
   */
  generateDependencyGraph(): DependencyGraph {
    const adrs = this.tracker.getAllADRs();
    const allLinks = this.getAllLinks();

    const nodes = adrs.map(adr => ({
      id: adr.id,
      title: adr.title,
      status: adr.status,
      impact: adr.metadata.impact,
      component: adr.component
    }));

    const edges = allLinks.map(link => ({
      from: link.fromADR,
      to: link.toADR,
      relationship: link.relationship,
      strength: link.strength
    }));

    // Find clusters based on components and connections
    const clusters = this.identifyClusters(nodes, edges);

    return { nodes, edges, clusters };
  }

  /**
   * 🎯 Identify clusters in the decision graph
   */
  private identifyClusters(nodes: DependencyGraph['nodes'], edges: DependencyGraph['edges']): DependencyGraph['clusters'] {
    const clusters: DependencyGraph['clusters'] = [];
    const visited = new Set<string>();

    // Component-based clustering
    const componentGroups = new Map<string, string[]>();
    for (const node of nodes) {
      if (!componentGroups.has(node.component)) {
        componentGroups.set(node.component, []);
      }
      componentGroups.get(node.component)!.push(node.id);
    }

    for (const [component, nodeIds] of componentGroups) {
      if (nodeIds.length > 1) {
        // Find most connected node as central node
        const connections = new Map<string, number>();
        for (const nodeId of nodeIds) {
          const count = edges.filter(e => e.from === nodeId || e.to === nodeId).length;
          connections.set(nodeId, count);
        }
        
        const centralNode = Array.from(connections.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0];

        clusters.push({
          id: `cluster_${component}`,
          name: component,
          nodes: nodeIds,
          centralNode
        });
        
        nodeIds.forEach(id => visited.add(id));
      }
    }

    // Find highly connected nodes that might form clusters
    const connectionCounts = new Map<string, Set<string>>();
    for (const edge of edges) {
      if (!connectionCounts.has(edge.from)) {
        connectionCounts.set(edge.from, new Set());
      }
      if (!connectionCounts.has(edge.to)) {
        connectionCounts.set(edge.to, new Set());
      }
      connectionCounts.get(edge.from)!.add(edge.to);
      connectionCounts.get(edge.to)!.add(edge.from);
    }

    // Find remaining highly connected groups
    for (const [nodeId, connections] of connectionCounts) {
      if (visited.has(nodeId) || connections.size < 2) continue;

      const connectedNodes = Array.from(connections).filter(id => !visited.has(id));
      if (connectedNodes.length >= 2) {
        const clusterNodes = [nodeId, ...connectedNodes];
        clusters.push({
          id: `cluster_connected_${nodeId}`,
          name: `Connected Group (${nodeId})`,
          nodes: clusterNodes,
          centralNode: nodeId
        });
        
        clusterNodes.forEach(id => visited.add(id));
      }
    }

    return clusters;
  }

  /**
   * 🔗 Get all links (custom + automatic)
   */
  getAllLinks(): DecisionLink[] {
    const links: DecisionLink[] = [];
    
    // Add custom links
    for (const linkArray of this.customLinks.values()) {
      links.push(...linkArray);
    }

    // Add automatic links from tracker
    const adrs = this.tracker.getAllADRs();
    for (const adr of adrs) {
      const trackerLinks = this.tracker.getLinksForADR(adr.id);
      links.push(...trackerLinks);
    }

    return links;
  }

  /**
   * 💥 Analyze impact of changing/removing an ADR
   */
  analyzeImpact(adrId: string): ImpactAnalysis {
    const adr = this.tracker.getADR(adrId);
    if (!adr) {
      throw new Error(`ADR not found: ${adrId}`);
    }

    const allLinks = this.getAllLinks();
    const directImpacts: string[] = [];
    const cascadeImpacts = new Set<string>();
    const affectedComponents = new Set<string>();

    // Find direct impacts
    for (const link of allLinks) {
      if (link.fromADR === adrId) {
        directImpacts.push(link.toADR);
        const linkedADR = this.tracker.getADR(link.toADR);
        if (linkedADR) {
          affectedComponents.add(linkedADR.component);
        }
      }
    }

    // Find cascade impacts
    const visited = new Set<string>([adrId]);
    const queue = [...directImpacts];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      cascadeImpacts.add(currentId);

      for (const link of allLinks) {
        if (link.fromADR === currentId && !visited.has(link.toADR)) {
          queue.push(link.toADR);
          const linkedADR = this.tracker.getADR(link.toADR);
          if (linkedADR) {
            affectedComponents.add(linkedADR.component);
          }
        }
      }
    }

    // Calculate risk score
    const riskFactors = {
      criticalImpact: adr.metadata.impact === 'critical' ? 30 : adr.metadata.impact === 'high' ? 20 : 10,
      directImpacts: Math.min(directImpacts.length * 10, 30),
      cascadeImpacts: Math.min(cascadeImpacts.size * 5, 25),
      acceptedStatus: adr.status === 'accepted' ? 15 : 0,
      componentSpread: Math.min(affectedComponents.size * 8, 20)
    };

    const riskScore = Math.min(
      Object.values(riskFactors).reduce((sum, score) => sum + score, 0),
      100
    );

    // Determine change complexity
    let changeComplexity: ImpactAnalysis['changeComplexity'] = 'low';
    if (riskScore > 70) changeComplexity = 'critical';
    else if (riskScore > 50) changeComplexity = 'high';
    else if (riskScore > 30) changeComplexity = 'medium';

    // Generate recommendations
    const recommendedActions: string[] = [];
    if (directImpacts.length > 0) {
      recommendedActions.push(`Review ${directImpacts.length} directly affected decisions`);
    }
    if (cascadeImpacts.size > 5) {
      recommendedActions.push('Conduct thorough impact assessment due to cascade effects');
    }
    if (affectedComponents.size > 2) {
      recommendedActions.push('Coordinate with multiple teams due to cross-component impact');
    }
    if (riskScore > 50) {
      recommendedActions.push('Consider gradual migration strategy');
      recommendedActions.push('Prepare rollback plan');
    }

    return {
      adrId,
      directImpacts,
      cascadeImpacts: Array.from(cascadeImpacts),
      riskScore,
      changeComplexity,
      affectedComponents: Array.from(affectedComponents),
      recommendedActions
    };
  }

  /**
   * 📊 Generate linking report
   */
  generateLinkingReport(): string {
    const allLinks = this.getAllLinks();
    const suggestions = this.suggestLinks();
    const graph = this.generateDependencyGraph();

    return `# 🔗 Decision Linking Report

## 📊 Overview
- **Total Links:** ${allLinks.length}
- **Custom Links:** ${Array.from(this.customLinks.values()).flat().length}
- **Link Suggestions:** ${suggestions.filter(s => s.confidence > 50).length} high-confidence
- **Clusters:** ${graph.clusters.length}

## 🔗 Link Types Distribution
${this.getLinkTypeDistribution(allLinks)
  .map(([type, count]) => `- **${type}:** ${count}`)
  .join('\n')}

## 🎯 High-Confidence Link Suggestions
${suggestions
  .filter(s => s.confidence > 70)
  .slice(0, 10)
  .map(s => `- **${s.fromADR}** → **${s.toADR}** (${s.confidence}%): ${s.reason}`)
  .join('\n')}

## 📊 Cluster Analysis
${graph.clusters
  .map(cluster => `- **${cluster.name}:** ${cluster.nodes.length} decisions${cluster.centralNode ? ` (central: ${cluster.centralNode})` : ''}`)
  .join('\n')}

## 🎯 Most Connected Decisions
${this.getMostConnected(allLinks)
  .slice(0, 5)
  .map(([adrId, count]) => {
    const adr = this.tracker.getADR(adrId);
    return `- **${adrId}:** ${adr?.title} (${count} connections)`;
  })
  .join('\n')}

---
*Generated by KRINS-Chronicle-Keeper Decision Linker*
`;
  }

  /**
   * 📊 Get link type distribution
   */
  private getLinkTypeDistribution(links: DecisionLink[]): [string, number][] {
    const distribution = new Map<string, number>();
    for (const link of links) {
      distribution.set(link.relationship, (distribution.get(link.relationship) || 0) + 1);
    }
    return Array.from(distribution.entries()).sort((a, b) => b[1] - a[1]);
  }

  /**
   * 🔗 Get most connected decisions
   */
  private getMostConnected(links: DecisionLink[]): [string, number][] {
    const connections = new Map<string, number>();
    for (const link of links) {
      connections.set(link.fromADR, (connections.get(link.fromADR) || 0) + 1);
      connections.set(link.toADR, (connections.get(link.toADR) || 0) + 1);
    }
    return Array.from(connections.entries()).sort((a, b) => b[1] - a[1]);
  }
}

// CLI interface
if (import.meta.main) {
  const linker = new DecisionLinker();
  
  const command = Bun.argv[2];
  
  switch (command) {
    case 'suggest':
      const adrId = Bun.argv[3];
      const suggestions = linker.suggestLinks(adrId);
      console.log(`🔗 Found ${suggestions.length} link suggestions:`);
      suggestions.slice(0, 10).forEach(s => {
        console.log(`- ${s.fromADR} → ${s.toADR} (${s.confidence}%): ${s.reason}`);
      });
      break;
      
    case 'link':
      const from = Bun.argv[3];
      const to = Bun.argv[4];
      const relationship = Bun.argv[5] as DecisionLink['relationship'] || 'related_to';
      const description = Bun.argv[6] || 'Manual link';
      
      if (from && to) {
        const success = linker.addLink(from, to, relationship, description);
        console.log(success ? '✅ Link added successfully' : '❌ Failed to add link');
      } else {
        console.log('Usage: bun decision-linker.ts link <fromADR> <toADR> [relationship] [description]');
      }
      break;
      
    case 'impact':
      const targetAdr = Bun.argv[3];
      if (targetAdr) {
        const analysis = linker.analyzeImpact(targetAdr);
        console.log(`💥 Impact Analysis for ${targetAdr}:`);
        console.log(`- Risk Score: ${analysis.riskScore}/100`);
        console.log(`- Change Complexity: ${analysis.changeComplexity}`);
        console.log(`- Direct Impacts: ${analysis.directImpacts.length}`);
        console.log(`- Cascade Impacts: ${analysis.cascadeImpacts.length}`);
        console.log(`- Affected Components: ${analysis.affectedComponents.join(', ')}`);
        console.log('- Recommendations:');
        analysis.recommendedActions.forEach(action => console.log(`  - ${action}`));
      } else {
        console.log('Usage: bun decision-linker.ts impact <adrId>');
      }
      break;
      
    case 'graph':
      const graph = linker.generateDependencyGraph();
      console.log(JSON.stringify(graph, null, 2));
      break;
      
    case 'report':
      console.log(linker.generateLinkingReport());
      break;
      
    default:
      console.log(`
🔗 KRINS Decision Linker

Usage: bun decision-linker.ts <command>

Commands:
  suggest [adrId]                    Suggest links for ADR or all ADRs
  link <from> <to> [rel] [desc]     Add custom link between ADRs
  impact <adrId>                    Analyze impact of changing ADR
  graph                             Generate dependency graph JSON
  report                            Generate linking report

Examples:
  bun decision-linker.ts suggest ADR-0001
  bun decision-linker.ts link ADR-0001 ADR-0002 depends_on "Database choice affects auth"
  bun decision-linker.ts impact ADR-0001
  bun decision-linker.ts report > linking-report.md
      `);
  }
}