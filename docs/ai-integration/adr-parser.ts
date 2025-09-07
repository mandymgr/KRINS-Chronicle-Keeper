/**
 * 📄 KRINS-Chronicle-Keeper ADR Parser
 * Institutional Memory & Knowledge System - ADR Parsing & Analysis
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

export interface ParsedADR {
  number: string;
  title: string;
  status: 'Proposed' | 'Accepted' | 'Rejected' | 'Superseded';
  date: Date;
  context: string;
  decision: string;
  consequences: string;
  evidence?: string[];
  relatedADRs?: string[];
  tags?: string[];
  filePath: string;
  rawContent: string;
}

export interface ADRMetrics {
  totalADRs: number;
  statusBreakdown: Record<string, number>;
  recentlyModified: ParsedADR[];
  mostReferenced: ParsedADR[];
  averageAge: number;
  categories: Record<string, number>;
}

/**
 * ADR Parser for extracting structured data from ADR markdown files
 */
export class ADRParser {
  private static readonly ADR_SECTIONS = {
    STATUS: /^##\s*Status\s*$/gim,
    CONTEXT: /^##\s*Context\s*$/gim,
    DECISION: /^##\s*Decision\s*$/gim,
    CONSEQUENCES: /^##\s*Consequences\s*$/gim,
    EVIDENCE: /^##\s*Evidence\s*$/gim,
    RELATED: /^##\s*Related\s*(?:ADRs?)?\s*$/gim
  };

  constructor(private readonly adrPath: string = './docs/adr') {}

  /**
   * Parse all ADR files in the directory
   */
  async parseAllADRs(): Promise<ParsedADR[]> {
    try {
      const files = await readdir(this.adrPath);
      const adrFiles = files.filter(file => 
        file.endsWith('.md') && file.match(/^\d+/) && file !== 'index.md'
      );

      const adrs: ParsedADR[] = [];
      for (const file of adrFiles) {
        try {
          const adr = await this.parseADRFile(join(this.adrPath, file));
          if (adr) {
            adrs.push(adr);
          }
        } catch (error) {
          console.warn(`Failed to parse ADR file ${file}:`, error);
        }
      }

      return adrs.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    } catch (error) {
      console.error('Failed to read ADR directory:', error);
      return [];
    }
  }

  /**
   * Parse a single ADR file
   */
  async parseADRFile(filePath: string): Promise<ParsedADR | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.parseADRContent(content, filePath);
    } catch (error) {
      console.error(`Failed to read ADR file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Parse ADR content from string
   */
  parseADRContent(content: string, filePath: string): ParsedADR | null {
    try {
      // Extract title from first h1
      const titleMatch = content.match(/^#\s*(.+)$/m);
      if (!titleMatch) {
        throw new Error('No title found in ADR');
      }

      // Extract ADR number from title or filename
      const title = titleMatch[1].trim();
      const numberMatch = title.match(/^(\d+)/) || filePath.match(/(\d+)/);
      if (!numberMatch) {
        throw new Error('No ADR number found');
      }

      const number = numberMatch[1];

      // Parse sections
      const sections = this.extractSections(content);
      
      // Extract status
      const status = this.parseStatus(sections.status);
      
      // Extract date (from git or file stats - simplified for now)
      const date = new Date(); // In real implementation, get from git history

      // Extract related ADRs
      const relatedADRs = this.extractRelatedADRs(sections.related);
      
      // Extract tags from content
      const tags = this.extractTags(content);

      return {
        number,
        title: title.replace(/^\d+\.\s*/, ''), // Remove number prefix
        status,
        date,
        context: sections.context || '',
        decision: sections.decision || '',
        consequences: sections.consequences || '',
        evidence: this.extractEvidence(sections.evidence),
        relatedADRs,
        tags,
        filePath,
        rawContent: content
      };
    } catch (error) {
      console.error(`Failed to parse ADR content:`, error);
      return null;
    }
  }

  /**
   * Extract sections from ADR content
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};

    // Find all section headers
    const sectionMatches: Array<{ name: string; index: number; regex: RegExp }> = [];
    
    for (const [name, regex] of Object.entries(ADRParser.ADR_SECTIONS)) {
      const matches = [...content.matchAll(regex)];
      matches.forEach(match => {
        if (match.index !== undefined) {
          sectionMatches.push({
            name: name.toLowerCase(),
            index: match.index,
            regex
          });
        }
      });
    }

    // Sort sections by position
    sectionMatches.sort((a, b) => a.index - b.index);

    // Extract content between sections
    for (let i = 0; i < sectionMatches.length; i++) {
      const current = sectionMatches[i];
      const next = sectionMatches[i + 1];
      
      const startIndex = current.index + content.substr(current.index).indexOf('\n') + 1;
      const endIndex = next ? next.index : content.length;
      
      const sectionContent = content
        .substring(startIndex, endIndex)
        .replace(/^##\s*[^#\n]+\s*\n?/gim, '') // Remove any remaining section headers
        .trim();
        
      sections[current.name] = sectionContent;
    }

    return sections;
  }

  /**
   * Parse status from status section
   */
  private parseStatus(statusText: string): ParsedADR['status'] {
    if (!statusText) return 'Proposed';
    
    const statusLower = statusText.toLowerCase();
    
    if (statusLower.includes('accepted')) return 'Accepted';
    if (statusLower.includes('rejected')) return 'Rejected';
    if (statusLower.includes('superseded')) return 'Superseded';
    
    return 'Proposed';
  }

  /**
   * Extract related ADRs from content
   */
  private extractRelatedADRs(relatedText: string): string[] {
    if (!relatedText) return [];
    
    // Find ADR references like "ADR-001" or "001"
    const matches = relatedText.match(/(?:ADR[-\s]?)?(\d+)/gi) || [];
    return matches.map(match => match.replace(/\D/g, ''));
  }

  /**
   * Extract evidence items
   */
  private extractEvidence(evidenceText: string): string[] {
    if (!evidenceText) return [];
    
    // Split by bullet points or numbered lists
    return evidenceText
      .split(/^[-*+]\s+|^\d+\.\s+/gm)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  /**
   * Extract tags from content
   */
  private extractTags(content: string): string[] {
    // Look for tags in various formats: #tag, Tags: tag1, tag2
    const tagMatches = [
      ...content.matchAll(/#(\w+)/g),
      ...content.matchAll(/(?:tags?|categories?):\s*([^.\n]+)/gi)
    ];

    const tags = new Set<string>();
    
    tagMatches.forEach(match => {
      if (match[1]) {
        const tagText = match[1].toLowerCase();
        // Split comma-separated tags
        tagText.split(/[,\s]+/).forEach(tag => {
          const cleanTag = tag.trim().replace(/^#/, '');
          if (cleanTag.length > 0) {
            tags.add(cleanTag);
          }
        });
      }
    });

    return Array.from(tags);
  }

  /**
   * Generate ADR metrics
   */
  async generateMetrics(): Promise<ADRMetrics> {
    const adrs = await this.parseAllADRs();
    
    // Status breakdown
    const statusBreakdown: Record<string, number> = {};
    adrs.forEach(adr => {
      statusBreakdown[adr.status] = (statusBreakdown[adr.status] || 0) + 1;
    });

    // Recently modified (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyModified = adrs.filter(adr => adr.date > thirtyDaysAgo);

    // Most referenced ADRs
    const referenceCount = new Map<string, number>();
    adrs.forEach(adr => {
      adr.relatedADRs?.forEach(relatedNumber => {
        referenceCount.set(relatedNumber, (referenceCount.get(relatedNumber) || 0) + 1);
      });
    });

    const mostReferenced = adrs
      .map(adr => ({
        ...adr,
        referenceCount: referenceCount.get(adr.number) || 0
      }))
      .sort((a, b) => b.referenceCount - a.referenceCount)
      .slice(0, 5);

    // Average age
    const now = new Date();
    const totalAge = adrs.reduce((sum, adr) => {
      return sum + (now.getTime() - adr.date.getTime());
    }, 0);
    const averageAge = adrs.length > 0 ? totalAge / adrs.length / (1000 * 60 * 60 * 24) : 0;

    // Categories from tags
    const categories: Record<string, number> = {};
    adrs.forEach(adr => {
      adr.tags?.forEach(tag => {
        categories[tag] = (categories[tag] || 0) + 1;
      });
    });

    return {
      totalADRs: adrs.length,
      statusBreakdown,
      recentlyModified,
      mostReferenced,
      averageAge,
      categories
    };
  }

  /**
   * Find ADRs that might be relevant to a given topic
   */
  async findRelevantADRs(
    query: string,
    limit: number = 5
  ): Promise<ParsedADR[]> {
    const adrs = await this.parseAllADRs();
    const queryLower = query.toLowerCase();
    
    // Simple scoring based on keyword matches
    const scored = adrs.map(adr => {
      const searchText = [
        adr.title,
        adr.context,
        adr.decision,
        adr.consequences,
        ...(adr.tags || [])
      ].join(' ').toLowerCase();
      
      const words = queryLower.split(/\W+/).filter(w => w.length > 3);
      const matches = words.filter(word => searchText.includes(word)).length;
      
      return {
        adr,
        score: matches / words.length
      };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.adr);
  }
}

/**
 * Default parser instance
 */
export const adrParser = new ADRParser();

/**
 * Convenience functions
 */
export const parseAllADRs = () => adrParser.parseAllADRs();
export const parseADRFile = (filePath: string) => adrParser.parseADRFile(filePath);
export const generateADRMetrics = () => adrParser.generateMetrics();
export const findRelevantADRs = (query: string, limit?: number) => 
  adrParser.findRelevantADRs(query, limit);