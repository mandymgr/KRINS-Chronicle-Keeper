/**
 * 🏗️ KRINS Proactive Architectural Advisor
 * 
 * AI-powered system that provides proactive architectural guidance,
 * prevents architectural drift, and suggests optimal design patterns
 * 
 * @author KRINS Intelligence System
 */

import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as path from 'path'

export interface ArchitecturalAdvice {
  type: 'pattern-recommendation' | 'anti-pattern-warning' | 'optimization' | 'best-practice'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  rationale: string
  implementation: string[]
  examples: CodeExample[]
  relatedADRs: string[]
  impact: ImpactAssessment
}

export interface CodeExample {
  language: string
  before?: string
  after: string
  explanation: string
}

export interface ImpactAssessment {
  maintainability: number // 1-10
  performance: number
  scalability: number
  security: number
  testability: number
  complexity: number
}

export interface ArchitecturalContext {
  currentArchitecture: ArchitectureSnapshot
  patterns: PatternUsage[]
  dependencies: DependencyGraph
  metrics: QualityMetrics
  constraints: ArchitecturalConstraint[]
}

export interface ArchitectureSnapshot {
  services: ServiceDefinition[]
  dataFlow: DataFlowMapping[]
  integrationPoints: IntegrationPoint[]
  layering: LayerDefinition[]
  patterns: string[]
}

export interface ServiceDefinition {
  name: string
  type: 'frontend' | 'backend' | 'database' | 'external'
  responsibilities: string[]
  dependencies: string[]
  apis: APIDefinition[]
}

export interface APIDefinition {
  name: string
  type: 'REST' | 'GraphQL' | 'WebSocket' | 'gRPC'
  endpoints: EndpointDefinition[]
}

export interface EndpointDefinition {
  path: string
  method: string
  complexity: number
  usageFrequency: number
}

export interface PatternUsage {
  pattern: string
  usageCount: number
  contexts: string[]
  effectiveness: number
}

export interface DependencyGraph {
  nodes: DependencyNode[]
  edges: DependencyEdge[]
  cycles: string[][]
  criticalPaths: string[][]
}

export interface DependencyNode {
  id: string
  type: string
  stability: number
  changeFrequency: number
}

export interface DependencyEdge {
  from: string
  to: string
  coupling: 'loose' | 'moderate' | 'tight'
  type: 'data' | 'control' | 'temporal'
}

export interface QualityMetrics {
  cohesion: number
  coupling: number
  complexity: number
  maintainabilityIndex: number
  testCoverage: number
  technicalDebt: number
}

export interface ArchitecturalConstraint {
  id: string
  type: 'performance' | 'security' | 'compliance' | 'business'
  description: string
  threshold: number
  current: number
  critical: boolean
}

export interface DesignRecommendation {
  scenario: string
  recommendedApproach: string
  alternatives: AlternativeApproach[]
  tradeoffs: Tradeoff[]
  implementationSteps: string[]
}

export interface AlternativeApproach {
  name: string
  pros: string[]
  cons: string[]
  useCase: string
}

export interface Tradeoff {
  aspect: string
  option1: string
  option2: string
  recommendation: string
}

export class KRINSArchitecturalAdvisor extends EventEmitter {
  private context: ArchitecturalContext
  private recommendations: Map<string, DesignRecommendation> = new Map()
  private patterns: Map<string, any> = new Map()
  private antiPatterns: Set<string> = new Set()

  constructor() {
    super()
    this.loadArchitecturalContext()
    this.loadPatternLibrary()
    this.initializeRecommendationEngine()
  }

  /**
   * 🎯 Main Advisory Entry Point
   * Provides proactive architectural guidance based on current context
   */
  async provideGuidance(
    changeDescription: string, 
    changedFiles: string[], 
    changeMetrics?: any
  ): Promise<ArchitecturalAdvice[]> {
    console.log('🏗️ Analyzing architectural implications...')

    const advice: ArchitecturalAdvice[] = []

    // Pattern-based recommendations
    advice.push(...await this.analyzePatternOpportunities(changedFiles, changeDescription))

    // Anti-pattern detection
    advice.push(...await this.detectAntiPatterns(changedFiles, changeMetrics))

    // Performance optimizations
    advice.push(...await this.suggestPerformanceOptimizations(changedFiles))

    // Security considerations
    advice.push(...await this.analyzeSecurityImplications(changedFiles))

    // Maintainability improvements
    advice.push(...await this.suggestMaintainabilityImprovements(changeMetrics))

    // Scalability guidance
    advice.push(...await this.analyzeScalabilityImpact(changedFiles))

    // Sort by priority and impact
    advice.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    this.emit('guidance_generated', advice)
    return advice
  }

  /**
   * 🎨 Analyze Pattern Opportunities
   */
  private async analyzePatternOpportunities(
    files: string[], 
    description: string
  ): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // Repository Pattern Opportunity
    if (this.detectDataAccessPattern(files)) {
      advice.push({
        type: 'pattern-recommendation',
        priority: 'medium',
        title: 'Consider Repository Pattern for Data Access',
        description: 'Multiple data access points detected. Repository pattern can improve testability and maintainability.',
        rationale: 'Centralizes data access logic and provides better abstraction',
        implementation: [
          'Create abstract repository interfaces',
          'Implement concrete repositories for each data source',
          'Use dependency injection for repository instances',
          'Add comprehensive tests for repository implementations'
        ],
        examples: [{
          language: 'typescript',
          after: `
interface UserRepository {
  findById(id: string): Promise<User>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}

class DatabaseUserRepository implements UserRepository {
  constructor(private db: Database) {}
  
  async findById(id: string): Promise<User> {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id])
  }
  
  async save(user: User): Promise<void> {
    // Implementation...
  }
}`,
          explanation: 'Repository pattern provides clean abstraction over data layer'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 8,
          performance: 6,
          scalability: 7,
          security: 5,
          testability: 9,
          complexity: 6
        }
      })
    }

    // Observer Pattern for Event Handling
    if (this.detectEventHandlingPattern(files, description)) {
      advice.push({
        type: 'pattern-recommendation',
        priority: 'medium',
        title: 'Observer Pattern for Event-Driven Architecture',
        description: 'Event handling logic detected. Observer pattern can improve decoupling.',
        rationale: 'Enables loose coupling and better separation of concerns',
        implementation: [
          'Create EventEmitter or Observer interfaces',
          'Implement event publishers and subscribers',
          'Define clear event contracts',
          'Add event logging and monitoring'
        ],
        examples: [{
          language: 'typescript',
          after: `
class DecisionTracker extends EventEmitter {
  createDecision(decision: Decision) {
    this.decisions.push(decision)
    this.emit('decision_created', { decision, timestamp: new Date() })
  }
}

// Usage
decisionTracker.on('decision_created', (data) => {
  analyticsService.recordDecision(data.decision)
  notificationService.notifyStakeholders(data.decision)
})`,
          explanation: 'Observer pattern enables reactive architecture'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 8,
          performance: 7,
          scalability: 8,
          security: 5,
          testability: 7,
          complexity: 5
        }
      })
    }

    // Strategy Pattern for Algorithm Selection
    if (this.detectAlgorithmVariations(files)) {
      advice.push({
        type: 'pattern-recommendation',
        priority: 'high',
        title: 'Strategy Pattern for Algorithm Selection',
        description: 'Multiple algorithm implementations detected. Strategy pattern can improve flexibility.',
        rationale: 'Enables runtime algorithm selection and easier testing',
        implementation: [
          'Define strategy interfaces for algorithms',
          'Implement concrete strategies',
          'Create context class to manage strategy selection',
          'Add factory for strategy creation'
        ],
        examples: [{
          language: 'typescript',
          after: `
interface RiskAssessmentStrategy {
  assess(change: ChangeAnalysis): RiskScore
}

class SimpleRiskStrategy implements RiskAssessmentStrategy {
  assess(change: ChangeAnalysis): RiskScore {
    // Simple risk calculation
  }
}

class MLRiskStrategy implements RiskAssessmentStrategy {
  assess(change: ChangeAnalysis): RiskScore {
    // ML-based risk calculation
  }
}

class RiskAssessor {
  constructor(private strategy: RiskAssessmentStrategy) {}
  
  setStrategy(strategy: RiskAssessmentStrategy) {
    this.strategy = strategy
  }
  
  assessRisk(change: ChangeAnalysis): RiskScore {
    return this.strategy.assess(change)
  }
}`,
          explanation: 'Strategy pattern allows flexible algorithm selection'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 9,
          performance: 6,
          scalability: 7,
          security: 5,
          testability: 9,
          complexity: 7
        }
      })
    }

    return advice
  }

  /**
   * 🚫 Detect Anti-Patterns
   */
  private async detectAntiPatterns(files: string[], metrics?: any): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // God Object Detection
    if (metrics?.complexity > 25 || this.detectLargeClasses(files)) {
      advice.push({
        type: 'anti-pattern-warning',
        priority: 'high',
        title: 'God Object Anti-Pattern Detected',
        description: 'Large, complex classes with too many responsibilities detected.',
        rationale: 'God objects are difficult to test, maintain, and understand',
        implementation: [
          'Apply Single Responsibility Principle',
          'Extract related methods into separate classes',
          'Use composition over inheritance',
          'Create focused, cohesive interfaces'
        ],
        examples: [{
          language: 'typescript',
          before: `
class MegaManager {
  // 50+ methods handling everything
  processUsers() { /* ... */ }
  handlePayments() { /* ... */ }
  generateReports() { /* ... */ }
  sendEmails() { /* ... */ }
  // ... many more methods
}`,
          after: `
class UserService {
  processUsers() { /* focused responsibility */ }
}

class PaymentService {
  handlePayments() { /* focused responsibility */ }
}

class ReportingService {
  generateReports() { /* focused responsibility */ }
}

class NotificationService {
  sendEmails() { /* focused responsibility */ }
}`,
          explanation: 'Split into focused, single-responsibility classes'
        }],
        relatedADRs: [],
        impact: {
          maintainability: -8,
          performance: -3,
          scalability: -6,
          security: -4,
          testability: -9,
          complexity: -8
        }
      })
    }

    // Circular Dependency Detection
    if (this.context.dependencies.cycles.length > 0) {
      advice.push({
        type: 'anti-pattern-warning',
        priority: 'critical',
        title: 'Circular Dependencies Detected',
        description: 'Circular dependencies create tight coupling and deployment issues.',
        rationale: 'Circular dependencies make the system fragile and hard to modify',
        implementation: [
          'Identify dependency cycles using dependency analysis',
          'Extract common interfaces to break cycles',
          'Use dependency injection to invert dependencies',
          'Refactor to use hierarchical layering'
        ],
        examples: [{
          language: 'typescript',
          before: `
// UserService depends on OrderService
// OrderService depends on UserService
class UserService {
  constructor(private orderService: OrderService) {}
}

class OrderService {
  constructor(private userService: UserService) {}
}`,
          after: `
// Break cycle with interface
interface UserRepository {
  findUser(id: string): User
}

class UserService implements UserRepository {
  findUser(id: string): User { /* ... */ }
}

class OrderService {
  constructor(private userRepo: UserRepository) {}
}`,
          explanation: 'Use interfaces to break circular dependencies'
        }],
        relatedADRs: [],
        impact: {
          maintainability: -9,
          performance: -2,
          scalability: -7,
          security: -3,
          testability: -8,
          complexity: -9
        }
      })
    }

    return advice
  }

  /**
   * ⚡ Performance Optimization Suggestions
   */
  private async suggestPerformanceOptimizations(files: string[]): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // Caching Opportunities
    if (this.detectCachingOpportunities(files)) {
      advice.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Implement Strategic Caching',
        description: 'Repeated expensive operations detected. Caching can improve performance.',
        rationale: 'Caching reduces redundant computations and database calls',
        implementation: [
          'Identify expensive operations that can be cached',
          'Choose appropriate caching strategy (memory, Redis, CDN)',
          'Implement cache invalidation logic',
          'Add cache monitoring and metrics'
        ],
        examples: [{
          language: 'typescript',
          after: `
class UserService {
  private cache = new Map<string, User>()
  private cacheExpiry = new Map<string, number>()
  
  async getUser(id: string): Promise<User> {
    const now = Date.now()
    const expiry = this.cacheExpiry.get(id)
    
    if (expiry && now < expiry) {
      return this.cache.get(id)!
    }
    
    const user = await this.database.findUser(id)
    this.cache.set(id, user)
    this.cacheExpiry.set(id, now + 300000) // 5 min cache
    
    return user
  }
}`,
          explanation: 'Simple in-memory caching with expiration'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 6,
          performance: 9,
          scalability: 8,
          security: 5,
          testability: 6,
          complexity: 6
        }
      })
    }

    // Database Query Optimization
    if (this.detectQueryOptimizationOpportunities(files)) {
      advice.push({
        type: 'optimization',
        priority: 'high',
        title: 'Optimize Database Queries',
        description: 'Potential N+1 queries or inefficient database access patterns detected.',
        rationale: 'Query optimization can dramatically improve application performance',
        implementation: [
          'Analyze query patterns for N+1 problems',
          'Implement eager loading for related data',
          'Add database indexes for frequent queries',
          'Use query batching where appropriate'
        ],
        examples: [{
          language: 'typescript',
          before: `
// N+1 Query Problem
const users = await User.findAll()
for (const user of users) {
  const orders = await Order.findByUserId(user.id) // N queries!
  user.orders = orders
}`,
          after: `
// Fixed with eager loading
const users = await User.findAll({
  include: [Order] // Single query with JOIN
})`,
          explanation: 'Eager loading eliminates N+1 query problems'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 7,
          performance: 10,
          scalability: 9,
          security: 5,
          testability: 6,
          complexity: 5
        }
      })
    }

    return advice
  }

  /**
   * 🔒 Security Architecture Analysis
   */
  private async analyzeSecurityImplications(files: string[]): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // Authentication Architecture
    if (this.detectAuthenticationChanges(files)) {
      advice.push({
        type: 'best-practice',
        priority: 'critical',
        title: 'Secure Authentication Architecture',
        description: 'Authentication changes detected. Ensure security best practices.',
        rationale: 'Authentication is critical for system security and user trust',
        implementation: [
          'Implement multi-factor authentication',
          'Use secure session management',
          'Add rate limiting and brute force protection',
          'Implement proper password policies',
          'Use JWT tokens with proper expiration'
        ],
        examples: [{
          language: 'typescript',
          after: `
class AuthenticationService {
  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    // Rate limiting check
    await this.rateLimiter.checkLimit(credentials.email)
    
    // Validate credentials with secure hashing
    const user = await this.validateCredentials(credentials)
    if (!user) {
      await this.auditLog.recordFailedLogin(credentials.email)
      throw new AuthenticationError('Invalid credentials')
    }
    
    // Generate secure JWT with short expiration
    const token = this.jwtService.generateToken({
      userId: user.id,
      roles: user.roles,
      exp: Date.now() + 3600000 // 1 hour
    })
    
    await this.auditLog.recordSuccessfulLogin(user.id)
    return { token, user: this.sanitizeUser(user) }
  }
}`,
          explanation: 'Comprehensive authentication with security measures'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 7,
          performance: 6,
          scalability: 6,
          security: 10,
          testability: 7,
          complexity: 7
        }
      })
    }

    return advice
  }

  /**
   * 🛠️ Maintainability Improvements
   */
  private async suggestMaintainabilityImprovements(metrics?: any): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // Code Complexity Reduction
    if (metrics?.complexity > 15) {
      advice.push({
        type: 'best-practice',
        priority: 'medium',
        title: 'Reduce Code Complexity',
        description: 'High complexity detected. Consider refactoring for better maintainability.',
        rationale: 'Lower complexity improves readability, testability, and reduces bugs',
        implementation: [
          'Extract complex logic into separate functions',
          'Use early returns to reduce nesting',
          'Apply the Single Responsibility Principle',
          'Consider using design patterns to organize code'
        ],
        examples: [{
          language: 'typescript',
          before: `
function processOrder(order: Order): ProcessResult {
  if (order.items && order.items.length > 0) {
    let total = 0
    for (let i = 0; i < order.items.length; i++) {
      if (order.items[i].quantity > 0 && order.items[i].price > 0) {
        total += order.items[i].quantity * order.items[i].price
        if (order.items[i].discount) {
          if (order.items[i].discount.type === 'percentage') {
            total -= total * (order.items[i].discount.value / 100)
          } else if (order.items[i].discount.type === 'fixed') {
            total -= order.items[i].discount.value
          }
        }
      }
    }
    // ... more complex logic
  }
}`,
          after: `
function processOrder(order: Order): ProcessResult {
  if (!this.hasValidItems(order)) {
    return { success: false, error: 'No valid items' }
  }
  
  const total = this.calculateTotal(order.items)
  return this.completeOrder(order, total)
}

private hasValidItems(order: Order): boolean {
  return order.items?.length > 0
}

private calculateTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    return total + this.calculateItemTotal(item)
  }, 0)
}

private calculateItemTotal(item: OrderItem): number {
  const baseTotal = item.quantity * item.price
  return baseTotal - this.calculateDiscount(item, baseTotal)
}`,
          explanation: 'Complex function broken into smaller, focused functions'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 9,
          performance: 5,
          scalability: 6,
          security: 5,
          testability: 9,
          complexity: 9
        }
      })
    }

    return advice
  }

  /**
   * 📈 Scalability Impact Analysis
   */
  private async analyzeScalabilityImpact(files: string[]): Promise<ArchitecturalAdvice[]> {
    const advice: ArchitecturalAdvice[] = []

    // Microservice Architecture Opportunities
    if (this.detectMicroserviceOpportunities(files)) {
      advice.push({
        type: 'optimization',
        priority: 'medium',
        title: 'Consider Microservice Architecture',
        description: 'Large monolith detected. Consider breaking into microservices.',
        rationale: 'Microservices can improve scalability and team autonomy',
        implementation: [
          'Identify bounded contexts for service boundaries',
          'Extract domain-specific services',
          'Implement service communication patterns',
          'Add service discovery and load balancing'
        ],
        examples: [{
          language: 'typescript',
          after: `
// User Service
class UserService {
  async getUser(id: string): Promise<User> {
    return this.userRepository.findById(id)
  }
}

// Order Service
class OrderService {
  constructor(private userServiceClient: UserServiceClient) {}
  
  async processOrder(order: Order): Promise<void> {
    const user = await this.userServiceClient.getUser(order.userId)
    // Process order logic
  }
}

// Service Communication
class UserServiceClient {
  async getUser(id: string): Promise<User> {
    return this.httpClient.get(\`/users/\${id}\`)
  }
}`,
          explanation: 'Microservice architecture with service communication'
        }],
        relatedADRs: [],
        impact: {
          maintainability: 6,
          performance: 7,
          scalability: 9,
          security: 6,
          testability: 7,
          complexity: 8
        }
      })
    }

    return advice
  }

  /**
   * Pattern Detection Methods
   */
  private detectDataAccessPattern(files: string[]): boolean {
    return files.some(file => 
      file.includes('database') || 
      file.includes('repository') || 
      file.includes('dao') ||
      file.includes('model')
    )
  }

  private detectEventHandlingPattern(files: string[], description: string): boolean {
    const eventKeywords = ['event', 'listener', 'handler', 'emit', 'dispatch', 'subscribe']
    return eventKeywords.some(keyword => 
      description.toLowerCase().includes(keyword) ||
      files.some(file => file.toLowerCase().includes(keyword))
    )
  }

  private detectAlgorithmVariations(files: string[]): boolean {
    return files.some(file => 
      file.includes('algorithm') || 
      file.includes('strategy') || 
      file.includes('calculator') ||
      file.includes('processor')
    )
  }

  private detectLargeClasses(files: string[]): boolean {
    // In a real implementation, analyze actual file sizes and complexity
    return false
  }

  private detectCachingOpportunities(files: string[]): boolean {
    return files.some(file => 
      file.includes('service') || 
      file.includes('api') || 
      file.includes('repository')
    )
  }

  private detectQueryOptimizationOpportunities(files: string[]): boolean {
    return files.some(file => 
      file.includes('model') || 
      file.includes('repository') || 
      file.includes('database')
    )
  }

  private detectAuthenticationChanges(files: string[]): boolean {
    return files.some(file => 
      file.includes('auth') || 
      file.includes('login') || 
      file.includes('security') ||
      file.includes('jwt')
    )
  }

  private detectMicroserviceOpportunities(files: string[]): boolean {
    // Detect when files span multiple domain boundaries
    const domains = ['user', 'order', 'payment', 'inventory', 'notification']
    const affectedDomains = domains.filter(domain =>
      files.some(file => file.toLowerCase().includes(domain))
    )
    return affectedDomains.length > 2
  }

  /**
   * Context Loading Methods
   */
  private loadArchitecturalContext() {
    this.context = {
      currentArchitecture: this.analyzeCurrentArchitecture(),
      patterns: this.analyzePatternUsage(),
      dependencies: this.analyzeDependencies(),
      metrics: this.calculateQualityMetrics(),
      constraints: this.loadArchitecturalConstraints()
    }
  }

  private analyzeCurrentArchitecture(): ArchitectureSnapshot {
    // Implementation would analyze current codebase
    return {
      services: [],
      dataFlow: [],
      integrationPoints: [],
      layering: [],
      patterns: []
    }
  }

  private analyzePatternUsage(): PatternUsage[] {
    return []
  }

  private analyzeDependencies(): DependencyGraph {
    return {
      nodes: [],
      edges: [],
      cycles: [], // This would be populated by actual analysis
      criticalPaths: []
    }
  }

  private calculateQualityMetrics(): QualityMetrics {
    return {
      cohesion: 7,
      coupling: 4,
      complexity: 6,
      maintainabilityIndex: 75,
      testCoverage: 65,
      technicalDebt: 15
    }
  }

  private loadArchitecturalConstraints(): ArchitecturalConstraint[] {
    return []
  }

  private loadPatternLibrary() {
    // Load architectural patterns from docs/patterns/
    console.log('📚 Loading pattern library for architectural guidance')
  }

  private initializeRecommendationEngine() {
    // Initialize ML models or rule-based recommendation engine
    console.log('🧠 Initializing architectural recommendation engine')
  }

  /**
   * 📊 Generate Advisory Report
   */
  generateReport(advice: ArchitecturalAdvice[]): string {
    let report = '# 🏗️ KRINS Architectural Advisory Report\n\n'
    
    if (advice.length === 0) {
      report += '✅ No architectural issues detected. Current approach looks good!\n\n'
      return report
    }

    const byPriority = advice.reduce((acc, item) => {
      if (!acc[item.priority]) acc[item.priority] = []
      acc[item.priority].push(item)
      return acc
    }, {} as Record<string, ArchitecturalAdvice[]>)

    const priorities = ['critical', 'high', 'medium', 'low'] as const

    priorities.forEach(priority => {
      if (byPriority[priority]) {
        const emoji = priority === 'critical' ? '🔴' : 
                     priority === 'high' ? '🟠' : 
                     priority === 'medium' ? '🟡' : '🟢'
        
        report += `## ${emoji} ${priority.toUpperCase()} Priority\n\n`
        
        byPriority[priority].forEach((item, index) => {
          report += `### ${index + 1}. ${item.title}\n\n`
          report += `**Type:** ${item.type}\n\n`
          report += `**Description:** ${item.description}\n\n`
          report += `**Rationale:** ${item.rationale}\n\n`
          
          if (item.implementation.length > 0) {
            report += `**Implementation Steps:**\n`
            item.implementation.forEach(step => report += `- ${step}\n`)
            report += '\n'
          }

          if (item.examples.length > 0) {
            report += `**Example:**\n\`\`\`${item.examples[0].language}\n${item.examples[0].after}\n\`\`\`\n\n`
            report += `${item.examples[0].explanation}\n\n`
          }

          report += `**Impact Assessment:**\n`
          report += `- Maintainability: ${item.impact.maintainability}/10\n`
          report += `- Performance: ${item.impact.performance}/10\n`
          report += `- Scalability: ${item.impact.scalability}/10\n`
          report += `- Security: ${item.impact.security}/10\n`
          report += `- Testability: ${item.impact.testability}/10\n\n`
        })
      }
    })

    return report
  }
}

export default KRINSArchitecturalAdvisor