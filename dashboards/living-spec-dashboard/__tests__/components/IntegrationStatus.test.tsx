import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationStatus } from '@/components/dashboard/IntegrationStatus';

// Mock fetch globally
global.fetch = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('IntegrationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state initially', () => {
    const mockResponse = new Promise(() => {}); // Never resolves
    vi.mocked(fetch).mockReturnValue(mockResponse as any);

    render(<IntegrationStatus />);

    expect(screen.getByText('Loading Integration Status...')).toBeInTheDocument();
  });

  it('renders healthy integrations correctly', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: '2024-01-15T10:00:00Z',
      integrations: [
        {
          name: 'github',
          enabled: true,
          healthy: true,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 0,
          rateLimit: {
            remaining: 4500,
            resetTime: '2024-01-15T11:00:00Z',
          },
        },
        {
          name: 'jira',
          enabled: true,
          healthy: true,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 0,
        },
      ],
      summary: {
        total: 2,
        enabled: 2,
        healthy: 2,
        degraded: 0,
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData),
    } as Response);

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('Integration Status')).toBeInTheDocument();
    });

    expect(screen.getByText('2 of 2 integrations enabled • 2 healthy')).toBeInTheDocument();
    expect(screen.getByText('Github')).toBeInTheDocument();
    expect(screen.getByText('Jira')).toBeInTheDocument();
    expect(screen.getAllByText('Healthy')).toHaveLength(2);
    expect(screen.getByText('Rate limit: 4500 remaining')).toBeInTheDocument();
  });

  it('renders unhealthy integrations correctly', async () => {
    const mockHealthData = {
      status: 'degraded',
      timestamp: '2024-01-15T10:00:00Z',
      integrations: [
        {
          name: 'github',
          enabled: true,
          healthy: false,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 1,
          lastError: 'Authentication failed',
        },
        {
          name: 'jira',
          enabled: false,
          healthy: false,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 0,
        },
      ],
      summary: {
        total: 2,
        enabled: 1,
        healthy: 0,
        degraded: 1,
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData),
    } as Response);

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('Integration Status')).toBeInTheDocument();
    });

    expect(screen.getByText('1 of 2 integrations enabled • 0 healthy')).toBeInTheDocument();
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(screen.getByText('Authentication failed')).toBeInTheDocument();
  });

  it('renders no integrations state', async () => {
    const mockHealthData = {
      status: 'no-integrations',
      timestamp: '2024-01-15T10:00:00Z',
      integrations: [
        {
          name: 'github',
          enabled: false,
          healthy: false,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 0,
        },
        {
          name: 'jira',
          enabled: false,
          healthy: false,
          lastCheck: '2024-01-15T10:00:00Z',
          nextCheck: '2024-01-15T10:05:00Z',
          errorCount: 0,
        },
      ],
      summary: {
        total: 2,
        enabled: 0,
        healthy: 0,
        degraded: 0,
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData),
    } as Response);

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('No integrations enabled')).toBeInTheDocument();
    });

    expect(screen.getByText('Enable GitHub or Jira integrations to see live data')).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('Integration Status Error')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('handles HTTP errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('Integration Status Error')).toBeInTheDocument();
    });

    expect(screen.getByText('HTTP 500: Internal Server Error')).toBeInTheDocument();
  });

  it('refreshes data when refresh button is clicked', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: '2024-01-15T10:00:00Z',
      integrations: [],
      summary: { total: 0, enabled: 0, healthy: 0, degraded: 0 },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData),
    } as Response);

    render(<IntegrationStatus />);

    await waitFor(() => {
      expect(screen.getByText('Integration Status')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button');
    fireEvent.click(refreshButton);

    expect(fetch).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('auto-refreshes every 5 minutes', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: '2024-01-15T10:00:00Z',
      integrations: [],
      summary: { total: 0, enabled: 0, healthy: 0, degraded: 0 },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData),
    } as Response);

    render(<IntegrationStatus />);

    // Wait for initial load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Fast forward 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});