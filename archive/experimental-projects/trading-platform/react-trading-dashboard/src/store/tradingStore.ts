import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface Order {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  quantity: number
  price?: number
  status: string
  timestamp: string
}

interface Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: string
}

interface OrderBook {
  symbol: string
  bids: [number, number][]
  asks: [number, number][]
  lastPrice: number
  spread: number
}

interface Portfolio {
  totalValue: number
  assets: Record<string, { quantity: number; value: number }>
}

interface TradingState {
  orders: Order[]
  trades: Trade[]
  orderbook: Record<string, OrderBook>
  portfolio: Portfolio
  isLoading: boolean
  error: string | null
  
  // Actions
  addOrder: (order: Order) => void
  updateOrder: (id: string, updates: Partial<Order>) => void
  removeOrder: (id: string) => void
  
  addTrade: (trade: Trade) => void
  
  updateOrderbook: (symbol: string, orderbook: Omit<OrderBook, 'symbol'>) => void
  
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  reset: () => void
}

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    orders: [],
    trades: [],
    orderbook: {},
    portfolio: {
      totalValue: 0,
      assets: {}
    },
    isLoading: false,
    error: null,
    
    addOrder: (order) => {
      set((state) => ({
        orders: [...state.orders, order]
      }))
    },
    
    updateOrder: (id, updates) => {
      set((state) => ({
        orders: state.orders.map(order => 
          order.id === id ? { ...order, ...updates } : order
        )
      }))
    },
    
    removeOrder: (id) => {
      set((state) => ({
        orders: state.orders.filter(order => order.id !== id)
      }))
    },
    
    addTrade: (trade) => {
      set((state) => ({
        trades: [trade, ...state.trades].slice(0, 100) // Keep last 100 trades
      }))
    },
    
    updateOrderbook: (symbol, orderbookData) => {
      set((state) => ({
        orderbook: {
          ...state.orderbook,
          [symbol]: {
            symbol,
            ...orderbookData
          }
        }
      }))
    },
    
    setLoading: (loading) => {
      set({ isLoading: loading })
    },
    
    setError: (error) => {
      set({ error })
    },
    
    reset: () => {
      set({
        orders: [],
        trades: [],
        orderbook: {},
        portfolio: { totalValue: 0, assets: {} },
        isLoading: false,
        error: null
      })
    }
  }))
)