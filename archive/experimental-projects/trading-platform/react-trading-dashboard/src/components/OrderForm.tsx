import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface OrderFormProps {
  onPlaceOrder: (order: any) => void
  isConnected: boolean
}

const OrderForm: React.FC<OrderFormProps> = ({ onPlaceOrder, isConnected }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Not connected to trading server')
      return
    }

    if (!quantity || (orderType === 'limit' && !price)) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const order = {
        symbol: 'BTCUSD',
        side,
        orderType,
        quantity: parseFloat(quantity),
        price: orderType === 'limit' ? parseFloat(price) : undefined,
        userId: 1 // Mock user ID
      }

      await onPlaceOrder(order)
      
      // Reset form on success
      setQuantity('')
      if (orderType === 'limit') {
        setPrice('')
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Order Type Tabs */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            orderType === 'market'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Market
        </button>
        <button
          type="button"
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            orderType === 'limit'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Limit
        </button>
      </div>

      {/* Side Selector */}
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            side === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
            side === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            step="0.00000001"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="trading-input w-full"
            placeholder="0.00000000"
            required
          />
        </div>

        {/* Price Input - Only for Limit Orders */}
        {orderType === 'limit' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
              Price (USD)
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="trading-input w-full"
              placeholder="0.00"
              required
            />
          </motion.div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Side:</span>
            <span className={side === 'buy' ? 'text-green-400' : 'text-red-400'}>
              {side.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Type:</span>
            <span className="text-gray-200">{orderType.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Quantity:</span>
            <span className="text-gray-200">{quantity || '0.00000000'} BTC</span>
          </div>
          {orderType === 'limit' && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price:</span>
              <span className="text-gray-200">${price || '0.00'}</span>
            </div>
          )}
          <div className="border-t border-gray-600 pt-2 flex justify-between text-sm font-medium">
            <span className="text-gray-400">Total:</span>
            <span className="text-gray-200">
              ${orderType === 'limit' && quantity && price
                ? (parseFloat(quantity) * parseFloat(price)).toFixed(2)
                : orderType === 'market' && quantity
                ? (parseFloat(quantity) * 50000).toFixed(2) // Using current market price
                : '0.00'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !isConnected}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            side === 'buy'
              ? 'btn-buy hover:bg-green-600'
              : 'btn-sell hover:bg-red-600'
          } ${
            isSubmitting || !isConnected
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Placing Order...
            </div>
          ) : (
            `${side === 'buy' ? 'Buy' : 'Sell'} BTC`
          )}
        </motion.button>

        {/* Connection Status */}
        {!isConnected && (
          <div className="text-center text-red-400 text-sm">
            ⚠️ Not connected to trading server
          </div>
        )}
      </form>
    </div>
  )
}

export default OrderForm