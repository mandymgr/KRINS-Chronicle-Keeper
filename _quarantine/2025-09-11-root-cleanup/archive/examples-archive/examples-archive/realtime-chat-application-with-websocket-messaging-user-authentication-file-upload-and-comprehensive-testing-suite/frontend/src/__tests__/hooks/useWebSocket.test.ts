import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '../../hooks/useWebSocket';

// Mock socket.io-client
const mockSocket = {
  connected: false,
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  auth: {},
};

const mockIo = jest.fn(() => mockSocket);

jest.mock('socket.io-client', () => ({
  io: (...args: any[]) => mockIo(...args),
}));

describe('useWebSocket', () => {
  const defaultOptions = {
    url: 'http://localhost:3001',
    token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.on.mockClear();
    mockSocket.emit.mockClear();
    mockSocket.disconnect.mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => 
      useWebSocket({ ...defaultOptions, autoConnect: false })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.reconnectAttempt).toBe(0);
    expect(result.current.socket).toBe(null);
  });

  it('should auto-connect by default', () => {
    renderHook(() => useWebSocket(defaultOptions));

    expect(mockIo).toHaveBeenCalledWith(defaultOptions.url, {
      auth: { token: defaultOptions.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  });

  it('should not auto-connect when disabled', () => {
    renderHook(() => 
      useWebSocket({ ...defaultOptions, autoConnect: false })
    );

    expect(mockIo).not.toHaveBeenCalled();
  });

  it('should connect manually when connect() is called', () => {
    const { result } = renderHook(() => 
      useWebSocket({ ...defaultOptions, autoConnect: false })
    );

    act(() => {
      result.current.connect();
    });

    expect(mockIo).toHaveBeenCalledWith(defaultOptions.url, {
      auth: { token: defaultOptions.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  });

  it('should handle connection success', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    // Simulate connection success
    const connectCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];

    act(() => {
      connectCallback();
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it('should handle connection error', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    const errorCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect_error'
    )[1];

    act(() => {
      errorCallback({ message: 'Connection failed' });
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe('Connection failed: Connection failed');
  });

  it('should handle disconnect', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    // First connect
    const connectCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'connect'
    )[1];
    act(() => {
      connectCallback();
    });

    // Then disconnect
    const disconnectCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'disconnect'
    )[1];
    act(() => {
      disconnectCallback('client disconnect');
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Disconnected: client disconnect');
  });

  it('should handle reconnection attempts', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    const reconnectAttemptCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'reconnect_attempt'
    )[1];

    act(() => {
      reconnectAttemptCallback(3);
    });

    expect(result.current.isConnecting).toBe(true);
    expect(result.current.reconnectAttempt).toBe(3);
  });

  it('should handle successful reconnection', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    const reconnectCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'reconnect'
    )[1];

    act(() => {
      reconnectCallback(2);
    });

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it('should handle reconnection failure', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    const reconnectFailedCallback = mockSocket.on.mock.calls.find(
      call => call[0] === 'reconnect_failed'
    )[1];

    act(() => {
      reconnectFailedCallback();
    });

    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe('Reconnection failed after maximum attempts');
  });

  it('should emit events when connected', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));
    
    mockSocket.connected = true;
    result.current.socket = mockSocket;

    act(() => {
      result.current.emit('test-event', { data: 'test' });
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
  });

  it('should not emit events when not connected', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    mockSocket.connected = false;
    result.current.socket = mockSocket;

    act(() => {
      result.current.emit('test-event', { data: 'test' });
    });

    expect(mockSocket.emit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Cannot emit event \'test-event\': Socket not connected');

    consoleSpy.mockRestore();
  });

  it('should add event listeners', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));
    const callback = jest.fn();

    result.current.socket = mockSocket;

    act(() => {
      result.current.on('test-event', callback);
    });

    expect(mockSocket.on).toHaveBeenCalledWith('test-event', callback);
  });

  it('should remove event listeners', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));
    const callback = jest.fn();

    result.current.socket = mockSocket;

    act(() => {
      result.current.off('test-event', callback);
    });

    expect(mockSocket.off).toHaveBeenCalledWith('test-event', callback);
  });

  it('should remove all listeners for event when no callback provided', () => {
    const { result } = renderHook(() => useWebSocket(defaultOptions));

    result.current.socket = mockSocket;

    act(() => {
      result.current.off('test-event');
    });

    expect(mockSocket.off).toHaveBeenCalledWith('test-event');
  });

  it('should disconnect on unmount', () => {
    const { unmount } = renderHook(() => useWebSocket(defaultOptions));

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should handle manual disconnect', () => {
    const { result } = renderHook(() => 
      useWebSocket({ ...defaultOptions, autoConnect: false })
    );

    result.current.socket = mockSocket;

    act(() => {
      result.current.disconnect();
    });

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it('should reconnect when token changes', () => {
    const { result, rerender } = renderHook(
      ({ token }) => useWebSocket({ ...defaultOptions, token }),
      { initialProps: { token: 'initial-token' } }
    );

    mockSocket.connected = true;
    result.current.socket = mockSocket;

    // Change token
    rerender({ token: 'new-token' });

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockIo).toHaveBeenCalledTimes(2); // Initial connect + reconnect
  });

  it('should use custom reconnection options', () => {
    const customOptions = {
      ...defaultOptions,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    };

    renderHook(() => useWebSocket(customOptions));

    expect(mockIo).toHaveBeenCalledWith(customOptions.url, {
      auth: { token: customOptions.token },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  });

  it('should handle connection without token', () => {
    const { url, ...optionsWithoutToken } = defaultOptions;
    
    renderHook(() => useWebSocket({ url }));

    expect(mockIo).toHaveBeenCalledWith(url, {
      auth: undefined,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  });
});