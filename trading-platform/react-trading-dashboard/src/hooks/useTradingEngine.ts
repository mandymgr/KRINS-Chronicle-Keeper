import { useState, useCallback } from 'react'

// Mock trading engine interface
interface TradingEngine {
  place_order: (symbol: string, side: string, orderType: string, quantity: number, price: number, userId: number) => any
  get_orderbook: (symbol: string) => any
  cancel_order: (orderId: string) => boolean
  get_balance: (userId: number) => any
}

export const useTradingEngine = () => {
  const [engine, setEngine] = useState<TradingEngine | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeEngine = useCallback(async () => {
    try {
      // Mock initialization - in reality this would load the WASM module
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockEngine: TradingEngine = {
        place_order: (symbol, side, orderType, quantity, price, userId) => {
          console.log(`🚀 Mock WASM Order: ${side} ${quantity} ${symbol} at ${price}`)
          return {
            orderId: Date.now().toString(),
            status: 'accepted',
            latency: Math.random() * 5 // Mock sub-5ms latency
          }
        },
        get_orderbook: (symbol) => {
          // Mock orderbook data
          return {
            symbol,
            bids: [[49999, 1.5], [49998, 2.1], [49997, 0.8]],
            asks: [[50001, 1.2], [50002, 2.3], [50003, 1.7]]
          }
        },
        cancel_order: (orderId) => {
          console.log(`❌ Mock Cancel Order: ${orderId}`)
          return true
        },
        get_balance: (userId) => {
          return {
            USD: 50000,
            BTC: 2.5,
            ETH: 0
          }
        }
      }

      setEngine(mockEngine)
      setIsReady(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize trading engine')
      setIsReady(false)
    }
  }, [])

  return {
    engine,
    isReady,
    error,
    initializeEngine
  }
}