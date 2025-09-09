/**
 * 🎓 KRINS AI-Powered Onboarding API
 * 
 * RESTful API for the AI-powered onboarding intelligence system
 * Provides endpoints for learning paths, progress tracking, and personalization
 * 
 * @author KRINS Intelligence System  
 */

import express from 'express'
import cors from 'cors'
import { KRINSOnboardingIntelligence } from '../AI_INTEGRATION/onboarding-intelligence'

const app = express()
const onboardingSystem = new KRINSOnboardingIntelligence()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KRINS AI-Powered Onboarding API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Get all available learning paths
app.get('/api/onboarding/paths', (req, res) => {
  try {
    const paths = onboardingSystem.getAllLearningPaths()
    res.json({
      success: true,
      paths,
      count: paths.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get all available learning modules  
app.get('/api/onboarding/modules', (req, res) => {
  try {
    const modules = onboardingSystem.getAllLearningModules()
    res.json({
      success: true,
      modules,
      count: modules.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Create personalized onboarding for a user
app.post('/api/onboarding/users/:userId/create', async (req, res) => {
  try {
    const { userId } = req.params
    const userProfile = req.body

    // Validate required fields
    const requiredFields = ['name', 'email', 'role', 'department', 'experience_level']
    const missingFields = requiredFields.filter(field => !userProfile[field])
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      })
    }

    const user = {
      id: userId,
      ...userProfile,
      start_date: new Date()
    }

    const personalizedPath = await onboardingSystem.createPersonalizedOnboarding(user)

    res.json({
      success: true,
      message: 'Personalized onboarding created successfully',
      user,
      learningPath: personalizedPath
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get user progress summary
app.get('/api/onboarding/users/:userId/progress', (req, res) => {
  try {
    const { userId } = req.params
    const summary = onboardingSystem.getUserProgressSummary(userId)

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'User progress not found'
      })
    }

    res.json({
      success: true,
      progress: summary
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get next module for user
app.get('/api/onboarding/users/:userId/next-module', (req, res) => {
  try {
    const { userId } = req.params
    const nextModule = onboardingSystem.getNextModule(userId)

    if (!nextModule) {
      return res.status(404).json({
        success: false,
        message: 'No next module found. Either user not found or all modules completed.'
      })
    }

    res.json({
      success: true,
      module: nextModule
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Record module completion
app.post('/api/onboarding/users/:userId/modules/:moduleId/complete', async (req, res) => {
  try {
    const { userId, moduleId } = req.params
    const { score, timeSpent, feedback } = req.body

    if (typeof score !== 'number' || typeof timeSpent !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Score and timeSpent must be numbers'
      })
    }

    await onboardingSystem.recordModuleCompletion(userId, moduleId, score, timeSpent, feedback)

    // Get updated progress
    const updatedProgress = onboardingSystem.getUserProgressSummary(userId)

    res.json({
      success: true,
      message: 'Module completion recorded successfully',
      progress: updatedProgress
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get system-wide analytics
app.get('/api/onboarding/analytics', (req, res) => {
  try {
    const analytics = onboardingSystem.getSystemAnalytics()

    res.json({
      success: true,
      analytics
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get learning path by ID
app.get('/api/onboarding/paths/:pathId', (req, res) => {
  try {
    const { pathId } = req.params
    const paths = onboardingSystem.getAllLearningPaths()
    const path = paths.find(p => p.id === pathId)

    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      })
    }

    res.json({
      success: true,
      path
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get module by ID
app.get('/api/onboarding/modules/:moduleId', (req, res) => {
  try {
    const { moduleId } = req.params
    const modules = onboardingSystem.getAllLearningModules()
    const module = modules.find(m => m.id === moduleId)

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Learning module not found'
      })
    }

    res.json({
      success: true,
      module
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Demo endpoint for testing
app.get('/api/onboarding/demo/create-user', async (req, res) => {
  try {
    const demoUser = {
      id: 'demo_user_' + Date.now(),
      name: 'Demo User',
      email: 'demo@krins.ai',
      role: 'developer',
      department: 'engineering',
      experience_level: 'mid' as const,
      skills: ['javascript', 'react', 'node.js'],
      learning_preferences: {
        pace: 'moderate' as const,
        style: 'mixed' as const,
        time_available: 30
      },
      timezone: 'Europe/Oslo',
      start_date: new Date()
    }

    const personalizedPath = await onboardingSystem.createPersonalizedOnboarding(demoUser)

    res.json({
      success: true,
      message: 'Demo user created with personalized onboarding',
      user: demoUser,
      learningPath: personalizedPath
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Demo endpoint for completing a module
app.post('/api/onboarding/demo/complete-module', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required'
      })
    }

    const nextModule = onboardingSystem.getNextModule(userId as string)
    
    if (!nextModule) {
      return res.status(404).json({
        success: false,
        error: 'No next module found for user'
      })
    }

    // Simulate completion with random score
    const score = Math.floor(Math.random() * 30) + 70 // 70-100
    const timeSpent = Math.floor(Math.random() * 60) + 30 // 30-90 minutes

    await onboardingSystem.recordModuleCompletion(
      userId as string, 
      nextModule.id, 
      score, 
      timeSpent, 
      'Demo completion'
    )

    const updatedProgress = onboardingSystem.getUserProgressSummary(userId as string)

    res.json({
      success: true,
      message: `Demo completion of module: ${nextModule.title}`,
      completedModule: nextModule,
      score,
      timeSpent,
      progress: updatedProgress
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('API error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Event listeners for onboarding system
onboardingSystem.on('onboarding_created', (data) => {
  console.log(`🎓 Onboarding created for ${data.user.name}: ${data.learningPath.title}`)
})

onboardingSystem.on('module_completed', (data) => {
  console.log(`📖 Module completed: ${data.moduleId} by ${data.userId} (score: ${data.score})`)
})

onboardingSystem.on('milestone_achieved', (data) => {
  console.log(`🏆 Milestone achieved: ${data.milestone.title} by ${data.userId}`)
})

const PORT = process.env.ONBOARDING_PORT || 3003

export default app

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎓 KRINS AI-Powered Onboarding API running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
    console.log(`📚 Learning paths: http://localhost:${PORT}/api/onboarding/paths`)
    console.log(`🧩 Learning modules: http://localhost:${PORT}/api/onboarding/modules`)
    console.log(`👤 Demo user: http://localhost:${PORT}/api/onboarding/demo/create-user`)
  })

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down Onboarding API...')
    process.exit(0)
  })
}