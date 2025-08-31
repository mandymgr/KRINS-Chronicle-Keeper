import { useState, useCallback } from 'react'

interface PerformanceMetrics {
  fps: number
  latency: number
  memory: number
  orderLatency: number
  throughput: number
  activeConnections: number
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({})

  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const resetMetrics = useCallback(() => {
    setMetrics({})
  }, [])

  const getMetric = useCallback((key: keyof PerformanceMetrics) => {
    return metrics[key]
  }, [metrics])

  return {
    metrics,
    updateMetric,
    resetMetrics,
    getMetric
  }
}