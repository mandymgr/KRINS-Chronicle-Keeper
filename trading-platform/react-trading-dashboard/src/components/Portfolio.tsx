import React from 'react'
import { motion } from 'framer-motion'

interface PortfolioProps {
  portfolio: any
  trades: any[]
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio, trades }) => {
  // Mock portfolio data
  const mockPortfolio = {
    totalValue: 125000,
    totalPnL: 12500,
    pnlPercent: 11.11,
    assets: [
      { symbol: 'BTC', quantity: 2.5, value: 125000, pnl: 12500, price: 50000 },
      { symbol: 'ETH', quantity: 0, value: 0, pnl: 0, price: 3000 },
      { symbol: 'USD', quantity: 50000, value: 50000, pnl: 0, price: 1 }
    ]
  }

  const currentPortfolio = portfolio || mockPortfolio

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Portfolio</h1>
      
      {/* Portfolio Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="trading-card p-6 mb-6"
      >
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-400">Total Portfolio Value</div>
            <div className="text-2xl font-bold text-white">
              ${currentPortfolio.totalValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total P&L</div>
            <div className={`text-2xl font-bold ${currentPortfolio.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentPortfolio.totalPnL.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">P&L Percentage</div>
            <div className={`text-2xl font-bold ${currentPortfolio.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentPortfolio.pnlPercent >= 0 ? '+' : ''}{currentPortfolio.pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Holdings */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="trading-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Asset Holdings</h2>
        
        <div className="space-y-4">
          {currentPortfolio.assets.map((asset: any, index: number) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center font-bold text-white">
                  {asset.symbol.substring(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-white">{asset.symbol}</div>
                  <div className="text-sm text-gray-400">{asset.quantity} units</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-white">${asset.value.toLocaleString()}</div>
                <div className={`text-sm ${asset.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.pnl >= 0 ? '+' : ''}${asset.pnl.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Portfolio