import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

// Components
import TradingDashboard from './components/TradingDashboard'
import OrderForm from './components/OrderForm'
import Portfolio from './components/Portfolio'
import Settings from './components/Settings'
import LoadingSpinner from './components/LoadingSpinner'

// Hooks
import { useTradingEngine } from './hooks/useTradingEngine'
import { useWebSocket } from './hooks/useWebSocket'
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics'

// Stores
import { useTradingStore } from './store/tradingStore'

// Utilities
import { cn } from './utils/cn'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // 1 second
      refetchInterval: 100, // 100ms for real-time updates
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

interface AppContentProps {}

const AppContent: React.FC<AppContentProps> = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  
  // Trading store
  const { 
    orders, 
    trades, 
    orderbook, 
    portfolio, 
    isLoading,
    error,
    addOrder,
    updateOrderbook,
    addTrade
  } = useTradingStore()

  // WebSocket connection for real-time data
  const { 
    connect, 
    disconnect, 
    subscribe, 
    unsubscribe, 
    sendMessage,
    connectionStatus,
    latency 
  } = useWebSocket({
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
    onMessage: (data) => {
      console.log('📊 Real-time data:', data)
      
      switch (data.type) {
        case 'orderbook':
          updateOrderbook(data.symbol, data.data)
          break
        case 'trade':
          addTrade(data.data)
          break
        case 'order':
          addOrder(data.data)
          break
      }
    },
    onError: (error) => {
      console.error('❌ WebSocket error:', error)
    }
  })

  // Trading engine integration
  const { engine, isReady, initializeEngine } = useTradingEngine()

  // Performance metrics
  const { metrics, updateMetric, resetMetrics } = usePerformanceMetrics()

  // Initialize on mount
  useEffect(() => {
    console.log('🚀 Initializing Revolutionary Trading Dashboard...')
    
    // Initialize WASM trading engine
    initializeEngine().then(() => {
      console.log('✅ Trading engine ready!')
    }).catch((error) => {
      console.error('❌ Engine initialization failed:', error)
    })

    // Connect WebSocket
    connect()
    
    // Subscribe to default symbols
    setTimeout(() => {
      subscribe(['BTCUSD', 'ETHUSD', 'ADAUSD'])
    }, 1000)

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [connect, disconnect, subscribe, initializeEngine])

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateMetric('fps', Math.random() * 60 + 30) // Mock FPS
      updateMetric('latency', latency)
      updateMetric('memory', performance.memory?.usedJSHeapSize || 0)
    }, 100)

    return () => clearInterval(interval)
  }, [latency, updateMetric])

  // Handle place order
  const handlePlaceOrder = useCallback(async (orderData: any) => {
    if (!engine || !isReady) {
      console.error('❌ Trading engine not ready')
      return
    }

    const start = performance.now()
    
    try {
      // Place order via WASM engine
      const result = engine.place_order(
        orderData.symbol,
        orderData.side,
        orderData.orderType,
        orderData.quantity,
        orderData.price,
        orderData.userId || 1
      )
      
      const latency = performance.now() - start
      updateMetric('orderLatency', latency)
      
      console.log(`✅ Order placed in ${latency.toFixed(3)}ms:`, result)
      
      // Send via WebSocket for real-time updates
      sendMessage({
        action: 'place_order',
        ...orderData
      })
      
    } catch (error) {
      console.error('❌ Failed to place order:', error)
    }
  }, [engine, isReady, sendMessage, updateMetric])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
        <div className="ml-4 text-white">
          <div className="text-lg font-semibold">Loading Revolutionary Trading Dashboard...</div>
          <div className="text-sm text-gray-400 mt-1">Initializing microsecond trading engine</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-screen"
        >
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">🚀 Revolutionary Trading</h1>
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )}>
                </div>
                <span className="text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {latency > 0 && (
                  <span className="text-xs text-gray-400">
                    {latency.toFixed(1)}ms
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                FPS: {metrics.fps?.toFixed(0) || 0}
              </div>
              <div className="text-sm text-gray-400">
                Orders: {orders.length}
              </div>
              <div className="text-sm text-gray-400">
                Trades: {trades.length}
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  <TradingDashboard 
                    orderbook={orderbook}
                    trades={trades}
                    metrics={metrics}
                    onPlaceOrder={handlePlaceOrder}
                  />
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <OrderForm 
                    onPlaceOrder={handlePlaceOrder}
                    isConnected={isConnected}
                  />
                } 
              />
              <Route 
                path="/portfolio" 
                element={
                  <Portfolio 
                    portfolio={portfolio}
                    trades={trades}
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    metrics={metrics}
                    onResetMetrics={resetMetrics}
                  />
                } 
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="p-4 border-t border-gray-700 text-center text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <div>
                🌟 Revolutionary Trading System by Krin & Mandy
              </div>
              <div className="flex space-x-4">
                <span>Target: 1M tx/sec</span>
                <span>•</span>
                <span>Status: {isReady ? '🟢 Ready' : '🟡 Initializing'}</span>
                <span>•</span>
                <span>Engine: Rust WASM</span>
              </div>
            </div>
          </footer>
        </motion.div>
      </AnimatePresence>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDarkMode ? '#374151' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          }
        }}
      />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App