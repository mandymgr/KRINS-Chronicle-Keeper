import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OrderBookProps {
  orderbook: {
    bids: [number, number][]
    asks: [number, number][]
    symbol?: string
  }
}

const OrderBook: React.FC<OrderBookProps> = ({ orderbook }) => {
  const { displayBids, displayAsks, spread } = useMemo(() => {
    if (!orderbook || !orderbook.bids || !orderbook.asks) {
      // Mock data if no orderbook provided
      return {
        displayBids: [
          [49999, 1.5],
          [49998, 2.1],
          [49997, 0.8],
          [49996, 3.2],
          [49995, 1.9]
        ],
        displayAsks: [
          [50001, 1.2],
          [50002, 2.3],
          [50003, 1.7],
          [50004, 0.9],
          [50005, 2.6]
        ],
        spread: 2
      }
    }

    const bids = orderbook.bids.slice(0, 10).sort((a, b) => b[0] - a[0])
    const asks = orderbook.asks.slice(0, 10).sort((a, b) => a[0] - b[0])
    
    const topBid = bids[0]?.[0] || 0
    const topAsk = asks[0]?.[0] || 0
    const spread = topAsk - topBid

    return {
      displayBids: bids,
      displayAsks: asks,
      spread
    }
  }, [orderbook])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 text-sm font-medium text-gray-400">
        <span>Price (USD)</span>
        <span>Size (BTC)</span>
        <span>Total</span>
      </div>

      <div className="flex-1 flex flex-col space-y-2">
        {/* Asks (Sell Orders) */}
        <div className="flex-1 flex flex-col-reverse overflow-hidden">
          <AnimatePresence>
            {displayAsks.map(([price, size], index) => (
              <motion.div
                key={`ask-${price}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="orderbook-row orderbook-ask hover:bg-red-900/20 cursor-pointer"
              >
                <span className="text-red-400 font-mono text-right">
                  {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-300 font-mono text-right">
                  {size.toFixed(8)}
                </span>
                <span className="text-gray-400 font-mono text-right">
                  {(price * size).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Spread Display */}
        <motion.div 
          className="bg-gray-700 rounded px-3 py-2 text-center"
          animate={{ 
            borderColor: spread > 10 ? '#ef4444' : spread > 5 ? '#f59e0b' : '#10b981' 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs text-gray-400">Spread</div>
          <div className={`text-sm font-bold ${
            spread > 10 ? 'text-red-400' : spread > 5 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            ${spread.toFixed(2)}
          </div>
        </motion.div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence>
            {displayBids.map(([price, size], index) => (
              <motion.div
                key={`bid-${price}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className="orderbook-row orderbook-bid hover:bg-green-900/20 cursor-pointer"
              >
                <span className="text-green-400 font-mono text-right">
                  {price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-gray-300 font-mono text-right">
                  {size.toFixed(8)}
                </span>
                <span className="text-gray-400 font-mono text-right">
                  {(price * size).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Best Bid: <span className="text-green-400">${displayBids[0]?.[0]?.toFixed(2) || '0.00'}</span></span>
          <span>Best Ask: <span className="text-red-400">${displayAsks[0]?.[0]?.toFixed(2) || '0.00'}</span></span>
        </div>
      </div>
    </div>
  )
}

export default OrderBook