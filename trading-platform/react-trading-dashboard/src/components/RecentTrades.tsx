import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Trade {
  id: number
  symbol: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: string
}

interface RecentTradesProps {
  trades: Trade[]
}

const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  // Use mock data if no trades provided
  const displayTrades = trades.length > 0 ? trades : [
    { id: 1, symbol: 'BTCUSD', price: 50000.25, quantity: 0.5, side: 'buy' as const, timestamp: new Date().toISOString() },
    { id: 2, symbol: 'BTCUSD', price: 49999.75, quantity: 0.25, side: 'sell' as const, timestamp: new Date(Date.now() - 30000).toISOString() },
    { id: 3, symbol: 'BTCUSD', price: 50001.00, quantity: 1.2, side: 'buy' as const, timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 4, symbol: 'BTCUSD', price: 49998.50, quantity: 0.8, side: 'sell' as const, timestamp: new Date(Date.now() - 90000).toISOString() },
    { id: 5, symbol: 'BTCUSD', price: 50002.25, quantity: 2.1, side: 'buy' as const, timestamp: new Date(Date.now() - 120000).toISOString() },
  ]

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 text-sm font-medium text-gray-400">
        <span>Time</span>
        <span>Price</span>
        <span>Size</span>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto space-y-1">
        <AnimatePresence>
          {displayTrades.slice(0, 20).map((trade, index) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm hover:bg-gray-700/50 transition-colors cursor-pointer ${
                trade.side === 'buy' 
                  ? 'bg-green-900/20 hover:bg-green-900/30' 
                  : 'bg-red-900/20 hover:bg-red-900/30'
              }`}
            >
              {/* Time */}
              <span className="text-gray-400 font-mono text-xs">
                {formatTime(trade.timestamp)}
              </span>

              {/* Price */}
              <span className={`font-mono font-medium ${
                trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
              }`}>
                ${formatPrice(trade.price)}
              </span>

              {/* Quantity */}
              <span className="text-gray-300 font-mono text-xs">
                {trade.quantity.toFixed(4)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Total Trades:</span>
          <span className="text-gray-300">{displayTrades.length}</span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Volume (24h):</span>
          <span className="text-gray-300">
            {displayTrades.reduce((sum, trade) => sum + trade.quantity, 0).toFixed(2)} BTC
          </span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Avg Price:</span>
          <span className="text-gray-300">
            ${displayTrades.length > 0 
              ? (displayTrades.reduce((sum, trade) => sum + trade.price, 0) / displayTrades.length).toFixed(2)
              : '0.00'
            }
          </span>
        </div>

        {/* Buy/Sell Ratio */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Buy/Sell:</span>
          <div className="flex space-x-2">
            <span className="text-green-400">
              {((displayTrades.filter(t => t.side === 'buy').length / displayTrades.length) * 100).toFixed(0)}%
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-red-400">
              {((displayTrades.filter(t => t.side === 'sell').length / displayTrades.length) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecentTrades