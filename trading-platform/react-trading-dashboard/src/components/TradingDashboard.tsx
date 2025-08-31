import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import OrderBook from './OrderBook'
import TradingChart from './TradingChart'
import RecentTrades from './RecentTrades'
import OrderForm from './OrderForm'
import PerformanceMetrics from './PerformanceMetrics'

interface TradingDashboardProps {
  orderbook: any
  trades: any[]
  metrics: any
  onPlaceOrder: (order: any) => void
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({
  orderbook,
  trades,
  metrics,
  onPlaceOrder
}) => {
  const recentTrades = useMemo(() => trades.slice(-50), [trades])
  
  return (
    <div className="h-full p-4 grid grid-cols-12 grid-rows-12 gap-4 overflow-hidden">
      {/* Main Chart Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="col-span-8 row-span-8 trading-card"
      >
        <div className="h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">BTCUSD</h2>
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-mono font-bold text-green-400">
                $50,000.00
              </span>
              <span className="text-sm text-green-400">+1.25%</span>
            </div>
          </div>
          <div className="h-full">
            <TradingChart symbol="BTCUSD" />
          </div>
        </div>
      </motion.div>

      {/* Order Book */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="col-span-4 row-span-8 trading-card"
      >
        <div className="h-full p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Order Book</h3>
          <OrderBook orderbook={orderbook} />
        </div>
      </motion.div>

      {/* Order Form */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="col-span-4 row-span-4 trading-card"
      >
        <div className="h-full p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>
          <OrderForm onPlaceOrder={onPlaceOrder} isConnected={true} />
        </div>
      </motion.div>

      {/* Recent Trades */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="col-span-4 row-span-4 trading-card"
      >
        <div className="h-full p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
          <RecentTrades trades={recentTrades} />
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="col-span-4 row-span-4 trading-card"
      >
        <div className="h-full p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <PerformanceMetrics metrics={metrics} />
        </div>
      </motion.div>
    </div>
  )
}

export default TradingDashboard