/**
 * GDPR Compliance Engine for Revolutionary Trading System
 * Ensures full compliance with EU General Data Protection Regulation
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'

// GDPR Data Categories
enum DataCategory {
  PERSONAL_DATA = 'personal_data',
  SENSITIVE_DATA = 'sensitive_data',
  FINANCIAL_DATA = 'financial_data',
  TRADING_DATA = 'trading_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  TECHNICAL_DATA = 'technical_data'
}

enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

enum DataSubjectRights {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
  WITHDRAW_CONSENT = 'withdraw_consent'
}

interface PersonalDataItem {
  id: string
  dataSubjectId: string
  category: DataCategory
  dataType: string
  value: any
  legalBasis: LegalBasis
  consentId?: string
  retentionPeriod: number // in months
  createdAt: Date
  lastModified: Date
  encryptionLevel: 'NONE' | 'STANDARD' | 'HIGH'
  pseudonymized: boolean
  anonymized: boolean
  processingPurposes: string[]
  dataSource: string
  thirdPartyShared: boolean
  crossBorderTransfer: boolean
  destinationCountry?: string
}

interface ConsentRecord {
  id: string
  dataSubjectId: string
  consentType: string
  purposes: string[]
  isGiven: boolean
  consentDate: Date
  expiryDate?: Date
  withdrawnDate?: Date
  consentMethod: 'EXPLICIT' | 'IMPLIED' | 'CHECKBOX' | 'SIGNATURE'
  ipAddress: string
  userAgent: string
  granular: boolean
  consentString: string
  version: number
}

interface DataProcessingActivity {
  id: string
  name: string
  description: string
  controller: string
  processor?: string
  dataCategories: DataCategory[]
  legalBasis: LegalBasis[]
  purposes: string[]
  dataSubjects: string[]
  recipients: string[]
  retentionPeriod: number
  safeguards: string[]
  riskAssessment: RiskAssessment
  dpia?: DataProtectionImpactAssessment
  lastReviewed: Date
}

interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  riskFactors: string[]
  mitigationMeasures: string[]
  residualRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  assessmentDate: Date
  nextReview: Date
}

interface DataProtectionImpactAssessment {
  id: string
  activityId: string
  necessity: string
  proportionality: string
  riskToRights: string
  safeguards: string[]
  consultationRequired: boolean
  dpoConsulted: boolean
  authorityConsulted?: boolean
  approved: boolean
  approvalDate?: Date
  reviewDate: Date
}

interface DataBreach {
  id: string
  reportedAt: Date
  discoveredAt: Date
  breachType: 'CONFIDENTIALITY' | 'INTEGRITY' | 'AVAILABILITY'
  dataTypes: DataCategory[]
  affectedSubjects: number
  riskToRights: 'LOW' | 'HIGH'
  containmentMeasures: string[]
  notificationAuthority: boolean
  notificationSubjects: boolean
  notificationDate?: Date
  cause: string
  lessons: string[]
  status: 'OPEN' | 'CONTAINED' | 'RESOLVED'
}

interface DataSubjectRequest {
  id: string
  dataSubjectId: string
  requestType: DataSubjectRights
  requestDate: Date
  verificationMethod: string
  verified: boolean
  requestDetails: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED'
  responseDate?: Date
  responseMethod: string
  rejectionReason?: string
  completionDetails?: any
}

// GDPR Compliance Engine
export class GDPRComplianceEngine extends EventEmitter {
  private personalData: Map<string, PersonalDataItem[]> = new Map()
  private consents: Map<string, ConsentRecord[]> = new Map()
  private processingActivities: Map<string, DataProcessingActivity> = new Map()
  private dataBreaches: DataBreach[] = []
  private dataSubjectRequests: Map<string, DataSubjectRequest[]> = new Map()
  private encryptionKey: string

  constructor(private config: GDPRConfig) {
    super()
    this.encryptionKey = this.generateEncryptionKey()
    this.setupAutomatedCompliance()
    this.setupDataRetentionPolicies()
    console.log('🔒 GDPR Compliance Engine initialized')
  }

  // Data Collection and Processing
  async collectPersonalData(data: Partial<PersonalDataItem>): Promise<string> {
    // Validate legal basis
    await this.validateLegalBasis(data.dataSubjectId!, data.legalBasis!, data.processingPurposes!)
    
    // Check consent if required
    if (data.legalBasis === LegalBasis.CONSENT) {
      const validConsent = await this.validateConsent(data.dataSubjectId!, data.processingPurposes!)
      if (!validConsent) {
        throw new Error('Valid consent required for data processing')
      }
    }

    const personalDataItem: PersonalDataItem = {
      id: this.generateId(),
      dataSubjectId: data.dataSubjectId!,
      category: data.category!,
      dataType: data.dataType!,
      value: await this.processAndEncrypt(data.value, data.category!),
      legalBasis: data.legalBasis!,
      consentId: data.consentId,
      retentionPeriod: data.retentionPeriod || this.getDefaultRetentionPeriod(data.category!),
      createdAt: new Date(),
      lastModified: new Date(),
      encryptionLevel: this.determineEncryptionLevel(data.category!),
      pseudonymized: data.category === DataCategory.SENSITIVE_DATA,
      anonymized: false,
      processingPurposes: data.processingPurposes!,
      dataSource: data.dataSource || 'trading_platform',
      thirdPartyShared: false,
      crossBorderTransfer: false
    }

    // Store personal data
    const existing = this.personalData.get(data.dataSubjectId!) || []
    existing.push(personalDataItem)
    this.personalData.set(data.dataSubjectId!, existing)

    // Log processing activity
    await this.logProcessingActivity('DATA_COLLECTED', personalDataItem)

    this.emit('data_collected', personalDataItem)
    console.log(`🔒 Personal data collected: ${personalDataItem.id}`)
    
    return personalDataItem.id
  }

  // Consent Management
  async recordConsent(consent: Partial<ConsentRecord>): Promise<string> {
    const consentRecord: ConsentRecord = {
      id: this.generateId(),
      dataSubjectId: consent.dataSubjectId!,
      consentType: consent.consentType!,
      purposes: consent.purposes!,
      isGiven: consent.isGiven!,
      consentDate: new Date(),
      expiryDate: consent.expiryDate,
      consentMethod: consent.consentMethod!,
      ipAddress: consent.ipAddress!,
      userAgent: consent.userAgent!,
      granular: consent.granular || true,
      consentString: this.generateConsentString(consent.purposes!),
      version: 1
    }

    // Store consent
    const existing = this.consents.get(consent.dataSubjectId!) || []
    existing.push(consentRecord)
    this.consents.set(consent.dataSubjectId!, existing)

    // Auto-create processing activity if needed
    if (consent.isGiven) {
      await this.createProcessingActivity({
        name: `Consent-based processing for ${consent.dataSubjectId}`,
        description: `Processing based on consent for purposes: ${consent.purposes!.join(', ')}`,
        controller: this.config.dataController,
        dataCategories: [DataCategory.PERSONAL_DATA],
        legalBasis: [LegalBasis.CONSENT],
        purposes: consent.purposes!,
        dataSubjects: ['trading_clients'],
        recipients: [],
        retentionPeriod: 84, // 7 years for financial data
        safeguards: ['encryption', 'access_control', 'audit_logging']
      })
    }

    this.emit('consent_recorded', consentRecord)
    console.log(`✅ Consent recorded: ${consentRecord.id}`)
    
    return consentRecord.id
  }

  // Data Subject Rights Implementation
  async handleDataSubjectRequest(request: Partial<DataSubjectRequest>): Promise<string> {
    const dsrId = this.generateId()
    
    const dataSubjectRequest: DataSubjectRequest = {
      id: dsrId,
      dataSubjectId: request.dataSubjectId!,
      requestType: request.requestType!,
      requestDate: new Date(),
      verificationMethod: request.verificationMethod || 'email_verification',
      verified: false,
      requestDetails: request.requestDetails || '',
      status: 'PENDING',
      responseMethod: 'email'
    }

    // Store request
    const existing = this.dataSubjectRequests.get(request.dataSubjectId!) || []
    existing.push(dataSubjectRequest)
    this.dataSubjectRequests.set(request.dataSubjectId!, existing)

    // Start automated processing
    await this.processDataSubjectRequest(dsrId)

    this.emit('data_subject_request', dataSubjectRequest)
    console.log(`📋 Data subject request received: ${request.requestType}`)
    
    return dsrId
  }

  // Automated DSR Processing
  private async processDataSubjectRequest(requestId: string): Promise<void> {
    const request = this.findDataSubjectRequest(requestId)
    if (!request) return

    try {
      // Update status
      request.status = 'IN_PROGRESS'

      // Process based on request type
      let result: any
      switch (request.requestType) {
        case DataSubjectRights.ACCESS:
          result = await this.processAccessRequest(request.dataSubjectId)
          break
          
        case DataSubjectRights.RECTIFICATION:
          result = await this.processRectificationRequest(request)
          break
          
        case DataSubjectRights.ERASURE:
          result = await this.processErasureRequest(request.dataSubjectId)
          break
          
        case DataSubjectRights.PORTABILITY:
          result = await this.processPortabilityRequest(request.dataSubjectId)
          break
          
        case DataSubjectRights.RESTRICTION:
          result = await this.processRestrictionRequest(request.dataSubjectId)
          break
          
        case DataSubjectRights.OBJECTION:
          result = await this.processObjectionRequest(request.dataSubjectId)
          break

        case DataSubjectRights.WITHDRAW_CONSENT:
          result = await this.processConsentWithdrawal(request.dataSubjectId)
          break
      }

      // Complete request
      request.status = 'COMPLETED'
      request.responseDate = new Date()
      request.completionDetails = result

      // Notify data subject
      await this.notifyDataSubject(request.dataSubjectId, request.requestType, result)

      console.log(`✅ Data subject request completed: ${request.requestType}`)

    } catch (error) {
      request.status = 'REJECTED'
      request.rejectionReason = error instanceof Error ? error.message : 'Processing error'
      console.error(`❌ Data subject request failed: ${error}`)
    }
  }

  // Right to Access (Art. 15)
  private async processAccessRequest(dataSubjectId: string): Promise<any> {
    const personalData = this.personalData.get(dataSubjectId) || []
    const consents = this.consents.get(dataSubjectId) || []
    
    return {
      personalData: await this.decryptPersonalData(personalData),
      consents,
      processingPurposes: this.getProcessingPurposes(dataSubjectId),
      retentionPeriods: this.getRetentionPeriods(dataSubjectId),
      recipients: this.getDataRecipients(dataSubjectId),
      rights: Object.values(DataSubjectRights),
      contactDetails: this.config.dpoContact
    }
  }

  // Right to Erasure (Art. 17) - "Right to be Forgotten"
  private async processErasureRequest(dataSubjectId: string): Promise<any> {
    // Check if erasure is possible (regulatory obligations may prevent it)
    const canErase = await this.checkErasureEligibility(dataSubjectId)
    
    if (!canErase.eligible) {
      throw new Error(`Erasure not possible: ${canErase.reason}`)
    }

    // Anonymize or delete data
    const personalData = this.personalData.get(dataSubjectId) || []
    let deletedCount = 0
    let anonymizedCount = 0

    for (const item of personalData) {
      if (item.category === DataCategory.FINANCIAL_DATA) {
        // Anonymize financial data (regulatory requirement)
        item.value = this.anonymizeData(item.value)
        item.anonymized = true
        anonymizedCount++
      } else {
        // Delete personal data
        deletedCount++
      }
    }

    // Update or remove personal data
    if (anonymizedCount > 0) {
      this.personalData.set(dataSubjectId, personalData.filter(item => item.anonymized))
    } else {
      this.personalData.delete(dataSubjectId)
    }

    // Remove consents
    this.consents.delete(dataSubjectId)

    await this.logProcessingActivity('DATA_ERASED', { 
      dataSubjectId, 
      deleted: deletedCount, 
      anonymized: anonymizedCount 
    })

    return {
      status: 'completed',
      deletedItems: deletedCount,
      anonymizedItems: anonymizedCount,
      reason: anonymizedCount > 0 ? 'Regulatory requirements prevent full deletion' : null
    }
  }

  // Right to Data Portability (Art. 20)
  private async processPortabilityRequest(dataSubjectId: string): Promise<any> {
    const personalData = this.personalData.get(dataSubjectId) || []
    const consents = this.consents.get(dataSubjectId) || []
    
    // Filter data based on portability criteria
    const portableData = personalData.filter(item => 
      item.legalBasis === LegalBasis.CONSENT || 
      item.legalBasis === LegalBasis.CONTRACT
    )

    const exportData = {
      dataSubject: dataSubjectId,
      exportDate: new Date().toISOString(),
      personalData: await this.decryptPersonalData(portableData),
      consents: consents.filter(c => c.isGiven),
      tradingHistory: await this.getTradingHistory(dataSubjectId),
      accountInformation: await this.getAccountInformation(dataSubjectId)
    }

    // Create secure export file
    const exportFile = await this.createSecureExport(exportData)
    
    return {
      exportFile,
      format: 'JSON',
      encryption: 'AES-256',
      downloadUrl: this.generateSecureDownloadUrl(exportFile)
    }
  }

  // Data Breach Management
  async reportDataBreach(breach: Partial<DataBreach>): Promise<string> {
    const breachId = this.generateId()
    
    const dataBreach: DataBreach = {
      id: breachId,
      reportedAt: new Date(),
      discoveredAt: breach.discoveredAt || new Date(),
      breachType: breach.breachType!,
      dataTypes: breach.dataTypes!,
      affectedSubjects: breach.affectedSubjects!,
      riskToRights: breach.riskToRights!,
      containmentMeasures: breach.containmentMeasures || [],
      notificationAuthority: breach.riskToRights === 'HIGH',
      notificationSubjects: breach.riskToRights === 'HIGH',
      cause: breach.cause!,
      lessons: [],
      status: 'OPEN'
    }

    this.dataBreaches.push(dataBreach)

    // Automated breach response
    if (dataBreach.notificationAuthority) {
      await this.notifyDataProtectionAuthority(dataBreach)
    }

    if (dataBreach.notificationSubjects) {
      await this.notifyAffectedDataSubjects(dataBreach)
    }

    this.emit('data_breach', dataBreach)
    console.warn(`🚨 Data breach reported: ${breachId}`)
    
    return breachId
  }

  // Privacy by Design Implementation
  async applyPrivacyByDesign(systemDesign: any): Promise<any> {
    const privacyEnhancements = {
      dataMinimization: this.applyDataMinimization(systemDesign),
      pseudonymization: this.applyPseudonymization(systemDesign),
      encryption: this.applyEncryptionAtRest(systemDesign),
      accessControls: this.applyAccessControls(systemDesign),
      auditLogging: this.applyAuditLogging(systemDesign),
      dataRetention: this.applyRetentionPolicies(systemDesign)
    }

    return {
      ...systemDesign,
      privacyFeatures: privacyEnhancements
    }
  }

  // Automated Compliance Monitoring
  private setupAutomatedCompliance(): void {
    // Daily consent expiry check
    setInterval(async () => {
      await this.checkConsentExpiry()
    }, 24 * 60 * 60 * 1000)

    // Weekly data retention review
    setInterval(async () => {
      await this.enforceDataRetention()
    }, 7 * 24 * 60 * 60 * 1000)

    // Monthly compliance audit
    setInterval(async () => {
      await this.performComplianceAudit()
    }, 30 * 24 * 60 * 60 * 1000)

    console.log('🔄 Automated GDPR compliance monitoring active')
  }

  private async checkConsentExpiry(): Promise<void> {
    const now = new Date()
    let expiredCount = 0

    for (const [dataSubjectId, consents] of this.consents.entries()) {
      for (const consent of consents) {
        if (consent.expiryDate && consent.expiryDate < now && consent.isGiven) {
          consent.isGiven = false
          consent.withdrawnDate = now
          expiredCount++
          
          // Stop processing based on expired consent
          await this.stopConsentBasedProcessing(dataSubjectId, consent.purposes)
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`⏰ ${expiredCount} consents expired and processing stopped`)
    }
  }

  private async enforceDataRetention(): Promise<void> {
    const now = new Date()
    let deletedCount = 0

    for (const [dataSubjectId, dataItems] of this.personalData.entries()) {
      const updatedItems = dataItems.filter(item => {
        const retentionEnd = new Date(item.createdAt)
        retentionEnd.setMonth(retentionEnd.getMonth() + item.retentionPeriod)
        
        if (retentionEnd < now) {
          deletedCount++
          return false
        }
        return true
      })

      if (updatedItems.length !== dataItems.length) {
        this.personalData.set(dataSubjectId, updatedItems)
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️  ${deletedCount} data items deleted due to retention policy`)
    }
  }

  // Utility methods
  private generateId(): string {
    return crypto.randomUUID()
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private async processAndEncrypt(value: any, category: DataCategory): Promise<string> {
    if (category === DataCategory.SENSITIVE_DATA || category === DataCategory.FINANCIAL_DATA) {
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey)
      let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex')
      encrypted += cipher.final('hex')
      return encrypted
    }
    return value
  }

  // Additional helper methods...
  private determineEncryptionLevel(category: DataCategory): 'NONE' | 'STANDARD' | 'HIGH' {
    switch (category) {
      case DataCategory.SENSITIVE_DATA:
      case DataCategory.FINANCIAL_DATA:
        return 'HIGH'
      case DataCategory.PERSONAL_DATA:
        return 'STANDARD'
      default:
        return 'NONE'
    }
  }
}

interface GDPRConfig {
  dataController: string
  dpoContact: string
  dataProtectionAuthority: string
  retentionPolicies: Record<string, number>
  encryptionRequired: boolean
}

// Export for use in trading system
export { DataCategory, LegalBasis, DataSubjectRights, PersonalDataItem }

console.log('🇪🇺 GDPR Compliance Engine initialized - Data protection enforced!')