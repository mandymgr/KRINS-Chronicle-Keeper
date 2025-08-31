import React, { useEffect, useRef } from 'react'
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts'

interface TradingChartProps {
  symbol: string
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: '#1f2937' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: '#4b5563',
      },
      timeScale: {
        borderColor: '#4b5563',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#10b981',
      wickDownColor: '#ef4444',
      wickUpColor: '#10b981',
    })

    // Generate mock data
    const generateMockData = () => {
      const data = []
      let basePrice = 50000
      const now = Date.now()
      
      for (let i = 300; i >= 0; i--) {
        const time = Math.floor((now - i * 60 * 1000) / 1000) // 1-minute candles
        const variation = (Math.random() - 0.5) * 200
        const open = basePrice + variation
        const high = open + Math.random() * 100
        const low = open - Math.random() * 100
        const close = open + (Math.random() - 0.5) * 50
        
        data.push({
          time,
          open,
          high: Math.max(open, close, high),
          low: Math.min(open, close, low),
          close,
        })
        
        basePrice = close
      }
      
      return data
    }

    const mockData = generateMockData()
    candlestickSeries.setData(mockData)

    // Store references
    chartRef.current = chart
    candlestickSeriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      if (candlestickSeriesRef.current) {
        const lastDataPoint = mockData[mockData.length - 1]
        const newTime = Math.floor(Date.now() / 1000)
        const variation = (Math.random() - 0.5) * 50
        
        const newDataPoint = {
          time: newTime,
          open: lastDataPoint.close,
          high: lastDataPoint.close + Math.random() * 25,
          low: lastDataPoint.close - Math.random() * 25,
          close: lastDataPoint.close + variation,
        }
        
        newDataPoint.high = Math.max(newDataPoint.open, newDataPoint.close, newDataPoint.high)
        newDataPoint.low = Math.min(newDataPoint.open, newDataPoint.close, newDataPoint.low)
        
        candlestickSeriesRef.current.update(newDataPoint)
        mockData.push(newDataPoint)
        
        // Keep only last 300 data points
        if (mockData.length > 300) {
          mockData.shift()
        }
      }
    }, 5000) // Update every 5 seconds

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      clearInterval(updateInterval)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [])

  return (
    <div className="h-full w-full relative">
      <div 
        ref={chartContainerRef}
        className="absolute inset-0 trading-chart"
      />
      
      {/* Chart Controls */}
      <div className="absolute top-4 left-4 flex space-x-2">
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          1m
        </button>
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          5m
        </button>
        <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded">
          15m
        </button>
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          1h
        </button>
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          4h
        </button>
        <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
          1D
        </button>
      </div>

      {/* Chart Type Controls */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button 
          className="p-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          title="Candlestick Chart"
        >
          📊
        </button>
        <button 
          className="p-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
          title="Line Chart"
        >
          📈
        </button>
        <button 
          className="p-2 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
          title="Area Chart"
        >
          🌄
        </button>
      </div>

      {/* Loading overlay for initial load */}
      <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center opacity-0 pointer-events-none">
        <div className="text-white text-sm">Loading chart data...</div>
      </div>
    </div>
  )
}

export default TradingChart