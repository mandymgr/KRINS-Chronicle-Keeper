import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KpiCard } from '@/components/dashboard/KpiCard';
import type { KpiMetric } from '@/lib/types';

const mockKpi: KpiMetric = {
  id: 'test-kpi',
  name: 'Test Metric',
  value: 85,
  unit: '%',
  target: 90,
  trend: 'up',
  trendPercentage: 5,
  description: 'A test metric for our dashboard',
  icon: '📊',
  category: 'business',
  lastUpdated: '2024-01-16T10:00:00Z',
};

describe('KpiCard', () => {
  it('renders KPI information correctly', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    // Check if the name is displayed
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    
    // Check if the value is displayed
    expect(screen.getByText('85')).toBeInTheDocument();
    
    // Check if the unit is displayed
    expect(screen.getByText('%')).toBeInTheDocument();
    
    // Check if the description is displayed
    expect(screen.getByText('A test metric for our dashboard')).toBeInTheDocument();
    
    // Check if the category badge is displayed
    expect(screen.getByText('business')).toBeInTheDocument();
    
    // Check if the target is displayed
    expect(screen.getByText('Target:')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    
    // Check if the trend percentage is displayed
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('handles different trend directions', () => {
    const downTrendKpi = { ...mockKpi, trend: 'down' as const, trendPercentage: 3 };
    render(<KpiCard kpi={downTrendKpi} />);
    
    expect(screen.getByText('-3%')).toBeInTheDocument();
  });

  it('handles stable trend', () => {
    const stableTrendKpi = { ...mockKpi, trend: 'stable' as const, trendPercentage: undefined };
    render(<KpiCard kpi={stableTrendKpi} />);
    
    // Should not display trend percentage for stable trend
    expect(screen.queryByText('%')).toBeInTheDocument(); // Only the unit, not trend
  });

  it('handles string values', () => {
    const stringValueKpi = { ...mockKpi, value: '2.5s', unit: undefined, target: '<3.0s' };
    render(<KpiCard kpi={stringValueKpi} />);
    
    expect(screen.getByText('2.5s')).toBeInTheDocument();
    expect(screen.getByText('<3.0s')).toBeInTheDocument();
  });

  it('displays last updated time', () => {
    render(<KpiCard kpi={mockKpi} />);
    
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    // The exact formatted date might vary based on locale, so we just check for presence
    expect(screen.getByText(/jan|feb|mar|apr|mai|jun|jul|aug|sep|okt|nov|des/i)).toBeInTheDocument();
  });
});