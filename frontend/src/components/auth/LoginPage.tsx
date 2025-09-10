/**
 * 🔐 KRINS Chronicle Keeper Login Page
 * 
 * Secure authentication interface for organizational intelligence platform
 * Features KRINS branding and professional organizational design
 * 
 * @author KRINS Intelligence System
 */

import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  AlertCircle,
  CheckCircle,
  Building,
  Users
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/design-system/components/Card'
import { Button } from '@/design-system/components/Button'

type AuthMode = 'login' | 'register'

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  const { state, login, register, clearError } = useAuth()

  // Redirect if authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Clear errors when switching modes
  useEffect(() => {
    clearError()
    setValidationError('')
  }, [mode, clearError])

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setValidationError('Email and password are required')
      return false
    }

    if (mode === 'register' && !formData.name) {
      setValidationError('Name is required for registration')
      return false
    }

    if (formData.email && !formData.email.includes('@')) {
      setValidationError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }

    setValidationError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          department: formData.department
        })
      }
    } catch (error) {
      // Error is handled by context
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
    }
  }

  const demoCredentials = [
    { email: 'admin@krins.ai', role: 'System Admin', icon: Shield },
    { email: 'architect@krins.ai', role: 'Chief Architect', icon: Building },
    { email: 'developer@krins.ai', role: 'Senior Developer', icon: Users },
    { email: 'viewer@krins.ai', role: 'Stakeholder', icon: Eye }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-7xl grid lg:grid-cols-5 gap-12 items-center">
        
        {/* Branding Side - Asymmetric Layout */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block lg:col-span-3 space-y-12"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-display">
                  KRINS
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Chronicle Keeper
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 font-display leading-tight">
                Organizational Intelligence Platform
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xl leading-relaxed max-w-2xl">
                Advanced Architecture Decision Record management with AI-powered insights, 
                real-time collaboration, and comprehensive organizational intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-green-200/50 shadow-sm">
                <Zap className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-display">Real-time Analytics</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Live decision tracking and organizational health metrics with AI-powered insights
                </p>
              </div>
              <div className="space-y-4 p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-green-200/30 shadow-sm">
                <Shield className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 font-display">Secure & Compliant</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Enterprise-grade security with role-based access control and audit logging
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Auth Form Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="p-10 bg-white/90 backdrop-blur-lg border border-green-200/50 shadow-2xl rounded-3xl">
            <div className="space-y-6">
              
              {/* Mobile Header */}
              <div className="lg:hidden text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 font-display">KRINS Chronicle Keeper</h1>
                  <p className="text-gray-600">Organizational Intelligence Platform</p>
                </div>
              </div>

              {/* Form Header */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 font-display">
                  {mode === 'login' ? 'Welcome Back' : 'Join KRINS Intelligence'}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {mode === 'login' 
                    ? 'Access your organizational intelligence dashboard'
                    : 'Create your account to get started'
                  }
                </p>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {(state.error || validationError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      {state.error || validationError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'register' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="e.g., Engineering, Architecture"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {state.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>
                        {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                      </span>
                    </div>
                  ) : (
                    mode === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Mode Toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                  disabled={state.isLoading}
                >
                  {mode === 'login' ? (
                    <>Don't have an account? <span className="underline">Sign up</span></>
                  ) : (
                    <>Already have an account? <span className="underline">Sign in</span></>
                  )}
                </button>
              </div>

              {/* Demo Credentials */}
              {mode === 'login' && (
                <div className="border-t pt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Demo Credentials</p>
                    <p className="text-xs text-gray-500 mb-4">Password for all accounts: <code>krins2025</code></p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {demoCredentials.map((cred) => {
                      const Icon = cred.icon
                      return (
                        <button
                          key={cred.email}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, email: cred.email, password: 'krins2025' }))}
                          className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl border border-green-200/50 transition-colors group shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{cred.role}</p>
                              <p className="text-xs text-gray-600">{cred.email}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-semibold text-green-900 font-display">Enterprise Security</h4>
                    <p className="text-green-700 mt-2 leading-relaxed">
                      Your organizational data is protected with enterprise-grade security, 
                      role-based access control, and comprehensive audit logging.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}