/**
 * 🎓 KRINS AI-Powered Onboarding Dashboard
 * 
 * Interactive dashboard for personalized learning paths and progress tracking
 * Features adaptive learning, competency tracking, and intelligent recommendations
 * 
 * @author KRINS Intelligence System
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  BookOpen,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  Brain,
  Sparkles,
  CheckCircle,
  PlayCircle,
  Award,
  Users,
  Lightbulb,
  BarChart3,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/design-system/components/Card'
import { Badge } from '@/design-system/components/Badge'
import { Button } from '@/design-system/components/Button'

interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  experience_level: string
}

interface LearningModule {
  id: string
  title: string
  description: string
  type: string
  difficulty: string
  duration_minutes: number
  skills_developed: string[]
  competencies: string[]
}

interface LearningPath {
  id: string
  title: string
  description: string
  estimated_duration_days: number
  modules: string[]
  milestones: Milestone[]
}

interface Milestone {
  id: string
  title: string
  description: string
  celebration_message: string
}

interface ProgressSummary {
  user: User
  learningPath: LearningPath
  progress: {
    modulesCompleted: number
    totalModules: number
    completionPercentage: number
    milestonesAchieved: number
    totalTimeSpent: number
    lastActive: string
  }
  analytics: {
    completionRate: number
    averageSessionDuration: number
    engagementLevel: number
    currentStreak: number
  }
  recommendations: string[]
  nextModule: LearningModule | null
}

export function OnboardingDashboard() {
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null)
  const [allModules, setAllModules] = useState<LearningModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'learning' | 'progress' | 'achievements'>('overview')
  const [demoUser, setDemoUser] = useState<User | null>(null)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      // Create demo user for demonstration
      const demoResponse = await fetch('/api/onboarding/demo/create-user')
      const demoData = await demoResponse.json()
      
      if (demoData.success) {
        setDemoUser(demoData.user)
        
        // Get progress summary
        const progressResponse = await fetch(`/api/onboarding/users/${demoData.user.id}/progress`)
        const progressData = await progressResponse.json()
        
        if (progressData.success) {
          setProgressSummary(progressData.progress)
        }
      }

      // Get all modules
      const modulesResponse = await fetch('/api/onboarding/modules')
      const modulesData = await modulesResponse.json()
      
      if (modulesData.success) {
        setAllModules(modulesData.modules)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to initialize dashboard:', error)
      setIsLoading(false)
    }
  }

  const completeNextModule = async () => {
    if (!demoUser || !progressSummary?.nextModule) return

    try {
      const response = await fetch(`/api/onboarding/demo/complete-module?userId=${demoUser.id}`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        // Update progress summary
        setProgressSummary(data.progress)
        
        // Show celebration if milestone achieved
        if (data.progress.progress.milestonesAchieved > progressSummary.progress.milestonesAchieved) {
          showMilestoneCelebration()
        }
      }
    } catch (error) {
      console.error('Failed to complete module:', error)
    }
  }

  const showMilestoneCelebration = () => {
    // Simple celebration effect
    console.log('🎉 Milestone achieved!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!progressSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to KRINS Onboarding</h3>
            <p className="text-gray-600 mb-4">Let's create your personalized learning journey</p>
            <Button onClick={initializeDashboard} className="bg-indigo-500 hover:bg-indigo-600">
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                🎓 AI-Powered Learning Journey
              </h1>
              <p className="text-xl text-gray-600">
                Welcome back, {progressSummary.user.name}! Continue your personalized learning path.
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                  {progressSummary.user.role}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {progressSummary.user.experience_level}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {progressSummary.progress.milestonesAchieved} milestones
                  </span>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="text-6xl opacity-80"
            >
              🚀
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex space-x-2 mb-6 bg-white/60 backdrop-blur-sm rounded-lg p-2"
        >
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'learning', label: 'Learning', icon: BookOpen },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'achievements', label: 'Achievements', icon: Trophy }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {Math.round(progressSummary.progress.completionPercentage)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {progressSummary.progress.modulesCompleted}/{progressSummary.progress.totalModules} modules
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Target className="w-6 h-6 text-indigo-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Time Invested</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round(progressSummary.progress.totalTimeSpent / 60)}h
                          </p>
                          <p className="text-xs text-gray-500">
                            Avg {Math.round(progressSummary.analytics.averageSessionDuration)}min/session
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {progressSummary.analytics.currentStreak}
                          </p>
                          <p className="text-xs text-gray-500">days in a row</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Award className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Engagement</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(progressSummary.analytics.engagementLevel * 100)}%
                          </p>
                          <p className="text-xs text-gray-500">very engaged</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Current Module */}
              {progressSummary.nextModule && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <PlayCircle className="w-5 h-5 text-indigo-500" />
                        <span>Continue Learning</span>
                      </CardTitle>
                      <CardDescription>Ready to tackle your next module?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{progressSummary.nextModule.title}</h3>
                          <p className="text-gray-600 mb-3">{progressSummary.nextModule.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{progressSummary.nextModule.duration_minutes} minutes</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>{progressSummary.nextModule.difficulty}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{progressSummary.nextModule.type}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          onClick={completeNextModule}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          Start Module
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* AI Recommendations */}
              {progressSummary.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span>AI Recommendations</span>
                      </CardTitle>
                      <CardDescription>Personalized suggestions to optimize your learning</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {progressSummary.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">{recommendation}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                <CardHeader>
                  <CardTitle>Your Learning Path: {progressSummary.learningPath.title}</CardTitle>
                  <CardDescription>{progressSummary.learningPath.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressSummary.learningPath.modules.map((moduleId, index) => {
                      const module = allModules.find(m => m.id === moduleId)
                      const isCompleted = progressSummary.progress.modulesCompleted >= index + 1
                      const isCurrent = index === progressSummary.progress.modulesCompleted
                      
                      if (!module) return null

                      return (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isCompleted 
                              ? 'bg-green-50 border-green-200' 
                              : isCurrent 
                                ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-indigo-500 text-white' 
                                    : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-medium">{index + 1}</span>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{module.title}</h3>
                                <p className="text-sm text-gray-600">{module.description}</p>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span>{module.duration_minutes} min</span>
                                  <span>{module.difficulty}</span>
                                  <span>{module.type}</span>
                                </div>
                              </div>
                            </div>
                            {isCurrent && (
                              <Button 
                                onClick={completeNextModule}
                                size="sm"
                                className="bg-indigo-500 hover:bg-indigo-600"
                              >
                                Start
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Progress Chart Placeholder */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                <CardHeader>
                  <CardTitle>Learning Progress Over Time</CardTitle>
                  <CardDescription>Track your learning journey and competency development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                      <p className="text-gray-600">Progress visualization would appear here</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Showing competency scores, learning velocity, and milestone achievements
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Completion Rate</span>
                        <span className="font-medium">
                          {Math.round(progressSummary.analytics.completionRate * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Average Session</span>
                        <span className="font-medium">
                          {Math.round(progressSummary.analytics.averageSessionDuration)} min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement Level</span>
                        <span className="font-medium">
                          {Math.round(progressSummary.analytics.engagementLevel * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Streak</span>
                        <span className="font-medium">
                          {progressSummary.analytics.currentStreak} days
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Time Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Time</span>
                        <span className="font-medium">
                          {Math.round(progressSummary.progress.totalTimeSpent / 60)}h {progressSummary.progress.totalTimeSpent % 60}m
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estimated Remaining</span>
                        <span className="font-medium">
                          {Math.max(0, progressSummary.learningPath.estimated_duration_days - Math.floor(progressSummary.progress.totalTimeSpent / (60 * 8)))} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Daily Average</span>
                        <span className="font-medium">
                          {Math.round(progressSummary.progress.totalTimeSpent / Math.max(1, progressSummary.analytics.currentStreak))} min/day
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Milestones */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>Milestones</span>
                  </CardTitle>
                  <CardDescription>
                    Track your major learning achievements and celebrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressSummary.learningPath.milestones.map((milestone, index) => {
                      const isAchieved = index < progressSummary.progress.milestonesAchieved
                      
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isAchieved 
                              ? 'bg-yellow-50 border-yellow-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isAchieved 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {isAchieved ? (
                                <Trophy className="w-5 h-5" />
                              ) : (
                                <span className="text-lg">🏆</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{milestone.title}</h3>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                              {isAchieved && (
                                <p className="text-sm text-yellow-600 mt-1 italic">
                                  "{milestone.celebration_message}"
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Competencies */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span>Skills & Competencies</span>
                  </CardTitle>
                  <CardDescription>
                    Your growing expertise in organizational intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {progressSummary.nextModule?.skills_developed.map((skill, index) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">{skill.replace('_', ' ')}</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Developing
                        </Badge>
                      </div>
                    )) || <p className="text-gray-500">Complete modules to develop skills</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OnboardingDashboard