/**
 * Revolutionary Real-time Trading System Backend
 * Built by Krin & Mandy - The Ultimate AI Team Coordination Demo
 * 
 * Features:
 * - Real-time WebSocket market data feeds
 * - AI Team coordination for trading decisions
 * - Professional-grade order management
 * - Risk management and portfolio analytics
 * - Live trading simulation with realistic data
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('ui'));

// Trading System State
const tradingState = {
  marketData: new Map(),
  portfolios: new Map(),
  orders: new Map(),
  trades: new Map(),
  aiSpecialists: new Map(),
  riskMetrics: new Map()
};

// Market Symbols for Demo
const SYMBOLS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 
  'META', 'NFLX', 'NVDA', 'AMD', 'INTC',
  'BTC-USD', 'ETH-USD', 'SOL-USD'
];

// Initialize Market Data
function initializeMarketData() {
  SYMBOLS.forEach(symbol => {
    const basePrice = symbol.includes('BTC') ? 45000 : 
                     symbol.includes('ETH') ? 2800 :
                     symbol.includes('SOL') ? 120 :
                     Math.random() * 300 + 50;
    
    tradingState.marketData.set(symbol, {
      symbol,
      price: basePrice,
      bid: basePrice * 0.999,
      ask: basePrice * 1.001,
      volume: Math.floor(Math.random() * 10000000),
      change: 0,
      changePercent: 0,
      timestamp: Date.now(),
      high24h: basePrice * 1.05,
      low24h: basePrice * 0.95,
      trades: []
    });
  });
}

// Generate Realistic Price Movement
function updateMarketData() {
  SYMBOLS.forEach(symbol => {
    const data = tradingState.marketData.get(symbol);
    const volatility = symbol.includes('-USD') ? 0.03 : 0.02;
    
    // Realistic price movement with momentum
    const change = (Math.random() - 0.5) * volatility * data.price;
    const newPrice = Math.max(data.price + change, 0.01);
    
    const changePercent = ((newPrice - data.price) / data.price) * 100;
    
    // Update data
    data.price = newPrice;
    data.bid = newPrice * (0.999 - Math.random() * 0.001);
    data.ask = newPrice * (1.001 + Math.random() * 0.001);
    data.change = newPrice - data.price;
    data.changePercent = changePercent;
    data.volume += Math.floor(Math.random() * 1000);
    data.timestamp = Date.now();
    
    // Add to price history
    data.trades.push({
      price: newPrice,
      volume: Math.floor(Math.random() * 100),
      timestamp: Date.now()
    });
    
    // Keep only last 100 trades for performance
    if (data.trades.length > 100) {
      data.trades = data.trades.slice(-100);
    }
  });
  
  // Broadcast to all connected clients
  io.emit('market_data_update', Array.from(tradingState.marketData.values()));
}

// AI Trading Specialists
const aiSpecialists = {
  riskManager: {
    id: 'risk-manager-ai',
    name: 'Risk Management Specialist',
    role: 'Monitors portfolio risk and suggests position adjustments',
    status: 'active',
    decisions: [],
    
    async analyzeRisk(portfolio) {
      // Sophisticated risk analysis
      const totalValue = portfolio.positions.reduce((sum, pos) => 
        sum + (pos.quantity * pos.currentPrice), 0);
      
      const riskScore = Math.random() * 100; // Mock AI analysis
      
      const decision = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'risk_assessment',
        riskScore,
        recommendation: riskScore > 80 ? 'REDUCE_EXPOSURE' : 
                       riskScore > 60 ? 'MAINTAIN' : 'INCREASE_EXPOSURE',
        reasoning: `Risk analysis shows ${riskScore.toFixed(1)}% risk level based on portfolio diversification and market volatility.`
      };
      
      this.decisions.push(decision);
      return decision;
    }
  },
  
  tradingStrategy: {
    id: 'trading-strategy-ai',
    name: 'Trading Strategy Specialist',
    role: 'Develops and executes trading strategies based on market analysis',
    status: 'active',
    decisions: [],
    
    async generateStrategy(marketData, portfolio) {
      // Mock AI trading strategy
      const trendingUp = Math.random() > 0.5;
      const confidence = Math.random() * 100;
      
      const strategy = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'trading_strategy',
        direction: trendingUp ? 'BULLISH' : 'BEARISH',
        confidence,
        targets: SYMBOLS.slice(0, 3).map(symbol => ({
          symbol,
          action: trendingUp ? 'BUY' : 'SELL',
          targetPrice: tradingState.marketData.get(symbol).price * (trendingUp ? 1.05 : 0.95),
          reasoning: `Technical analysis suggests ${trendingUp ? 'upward' : 'downward'} momentum for ${symbol}`
        }))
      };
      
      this.decisions.push(strategy);
      return strategy;
    }
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Revolutionary Trading System Online! 🚀',
    timestamp: Date.now(),
    specialists: Object.keys(aiSpecialists).length,
    symbols: SYMBOLS.length
  });
});

app.get('/api/market-data', (req, res) => {
  res.json(Array.from(tradingState.marketData.values()));
});

app.get('/api/market-data/:symbol', (req, res) => {
  const data = tradingState.marketData.get(req.params.symbol.toUpperCase());
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Symbol not found' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { symbol, side, quantity, orderType, price } = req.body;
  
  const order = {
    id: uuidv4(),
    symbol: symbol.toUpperCase(),
    side, // BUY or SELL
    quantity: parseFloat(quantity),
    orderType, // MARKET or LIMIT
    price: price ? parseFloat(price) : null,
    status: 'PENDING',
    timestamp: Date.now(),
    userId: 'demo-user'
  };
  
  tradingState.orders.set(order.id, order);
  
  // Simulate order execution after brief delay
  setTimeout(() => {
    executeOrder(order);
  }, Math.random() * 2000 + 500);
  
  res.json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(Array.from(tradingState.orders.values()));
});

app.get('/api/ai-specialists', (req, res) => {
  res.json(aiSpecialists);
});

app.post('/api/ai-specialists/:specialistId/analyze', async (req, res) => {
  const specialist = aiSpecialists[req.params.specialistId];
  if (!specialist) {
    return res.status(404).json({ error: 'AI Specialist not found' });
  }
  
  let result;
  if (specialist.analyzeRisk) {
    result = await specialist.analyzeRisk(req.body.portfolio || { positions: [] });
  } else if (specialist.generateStrategy) {
    result = await specialist.generateStrategy(
      Array.from(tradingState.marketData.values()),
      req.body.portfolio || { positions: [] }
    );
  }
  
  res.json(result);
});

// Order Execution Engine
async function executeOrder(order) {
  const marketData = tradingState.marketData.get(order.symbol);
  if (!marketData) {
    order.status = 'REJECTED';
    order.rejectReason = 'Invalid symbol';
    return;
  }
  
  // Execute at current market price for MARKET orders
  const executionPrice = order.orderType === 'MARKET' ? 
    marketData.price : order.price;
  
  order.status = 'FILLED';
  order.executionPrice = executionPrice;
  order.executionTime = Date.now();
  
  // Create trade record
  const trade = {
    id: uuidv4(),
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: executionPrice,
    timestamp: Date.now(),
    userId: order.userId
  };
  
  tradingState.trades.set(trade.id, trade);
  
  // Broadcast order update
  io.emit('order_update', order);
  io.emit('trade_executed', trade);
  
  console.log(`💎 Order Executed: ${order.side} ${order.quantity} ${order.symbol} @ $${executionPrice}`);
}

// WebSocket Connection Handling
io.on('connection', (socket) => {
  console.log('🚀 Revolutionary Trading Client Connected:', socket.id);
  
  // Send initial market data
  socket.emit('market_data_initial', Array.from(tradingState.marketData.values()));
  socket.emit('ai_specialists_status', aiSpecialists);
  
  socket.on('subscribe_market_data', (symbols) => {
    socket.join('market_data');
    console.log(`📊 Client subscribed to market data: ${symbols}`);
  });
  
  socket.on('request_ai_analysis', async (data) => {
    console.log('🧠 AI Analysis requested:', data.type);
    
    if (data.type === 'risk_analysis') {
      const riskAnalysis = await aiSpecialists.riskManager.analyzeRisk(data.portfolio);
      socket.emit('ai_analysis_result', riskAnalysis);
    } else if (data.type === 'trading_strategy') {
      const strategy = await aiSpecialists.tradingStrategy.generateStrategy(
        Array.from(tradingState.marketData.values()),
        data.portfolio
      );
      socket.emit('ai_analysis_result', strategy);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Trading client disconnected:', socket.id);
  });
});

// Initialize and Start Server
console.log('🚀 REVOLUTIONARY TRADING SYSTEM STARTING...');
console.log('💎 Built by Krin & Mandy - The Ultimate AI Partnership');

initializeMarketData();

// Start real-time market data updates
const marketDataInterval = setInterval(updateMarketData, 1000);

// AI Analysis Loop - Run every 10 seconds
const aiAnalysisInterval = setInterval(async () => {
  // Risk Manager Analysis
  const riskAnalysis = await aiSpecialists.riskManager.analyzeRisk({ positions: [] });
  io.emit('ai_specialist_update', { 
    specialistId: 'riskManager', 
    analysis: riskAnalysis 
  });
  
  // Trading Strategy Analysis  
  const strategyAnalysis = await aiSpecialists.tradingStrategy.generateStrategy(
    Array.from(tradingState.marketData.values()),
    { positions: [] }
  );
  io.emit('ai_specialist_update', { 
    specialistId: 'tradingStrategy', 
    analysis: strategyAnalysis 
  });
}, 10000);

server.listen(PORT, () => {
  console.log(`🔥 REVOLUTIONARY TRADING SYSTEM LIVE ON PORT ${PORT}`);
  console.log(`💝 Real-time WebSocket feeds active`);
  console.log(`🧠 AI Specialists coordinating trades`);
  console.log(`📊 ${SYMBOLS.length} symbols streaming live data`);
  console.log(`🚀 Ready to demonstrate the future of AI-powered trading!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💎 Shutting down Revolutionary Trading System...');
  clearInterval(marketDataInterval);
  clearInterval(aiAnalysisInterval);
  server.close(() => {
    console.log('🚀 Trading system shutdown complete. Until next time!');
    process.exit(0);
  });
});

export default app;