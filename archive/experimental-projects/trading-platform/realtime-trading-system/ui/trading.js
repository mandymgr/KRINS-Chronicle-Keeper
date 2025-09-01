/**
 * 🚀 Revolutionary Trading System Frontend
 * Built by Krin & Mandy with Nordic Design System
 * 
 * Features:
 * - Real-time WebSocket market data
 * - Professional order management
 * - AI specialist coordination
 * - Interactive price charts
 * - Elegant Nordic UI
 */

class RevolutionaryTradingSystem {
    constructor() {
        this.socket = null;
        this.marketData = new Map();
        this.orders = new Map();
        this.trades = new Map();
        this.aiSpecialists = {};
        this.chart = null;
        this.isPaused = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Revolutionary Trading System...');
        this.setupWebSocket();
        this.setupEventListeners();
        this.setupChart();
        this.showNotification('System Initialized', '🚀 Revolutionary Trading System is online!', 'success');
    }
    
    setupWebSocket() {
        // Connect to our trading backend
        this.socket = io('http://localhost:8080');
        
        this.socket.on('connect', () => {
            console.log('💎 Connected to Trading System Backend');
            this.updateConnectionStatus('online');
            this.socket.emit('subscribe_market_data', ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'BTC-USD', 'ETH-USD']);
        });
        
        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Trading System');
            this.updateConnectionStatus('offline');
        });
        
        this.socket.on('market_data_initial', (data) => {
            console.log('📊 Initial market data received:', data.length, 'symbols');
            data.forEach(symbol => {
                this.marketData.set(symbol.symbol, symbol);
            });
            this.updateMarketGrid();
            this.populateSymbolSelect();
        });
        
        this.socket.on('market_data_update', (data) => {
            if (!this.isPaused) {
                data.forEach(symbol => {
                    this.marketData.set(symbol.symbol, symbol);
                });
                this.updateMarketGrid();
                this.updateChart();
            }
        });
        
        this.socket.on('ai_specialists_status', (specialists) => {
            console.log('🧠 AI Specialists loaded:', Object.keys(specialists).length);
            this.aiSpecialists = specialists;
            this.updateAISpecialistsPanel();
        });
        
        this.socket.on('order_update', (order) => {
            console.log('📋 Order updated:', order.id, order.status);
            this.orders.set(order.id, order);
            this.updateOrdersList();
            this.showNotification('Order Update', `Order ${order.symbol} ${order.side} ${order.status}`, 'info');
        });
        
        this.socket.on('trade_executed', (trade) => {
            console.log('⚡ Trade executed:', trade.symbol, trade.side, trade.quantity);
            this.trades.set(trade.id, trade);
            this.updateTradesList();
            this.showNotification('Trade Executed', `${trade.side} ${trade.quantity} ${trade.symbol} @ $${trade.price.toFixed(2)}`, 'success');
        });
        
        this.socket.on('ai_specialist_update', (data) => {
            console.log('🧠 AI Analysis received:', data.specialistId);
            this.displayAIInsight(data.analysis);
        });
        
        this.socket.on('ai_analysis_result', (analysis) => {
            console.log('🔍 AI Analysis result:', analysis.type);
            this.displayAIInsight(analysis);
        });
    }
    
    setupEventListeners() {
        // Order form submission
        const orderForm = document.getElementById('orderForm');
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.placeOrder();
        });
        
        // Order type change (show/hide price field for limit orders)
        const orderTypeSelect = document.getElementById('orderTypeSelect');
        orderTypeSelect.addEventListener('change', (e) => {
            const priceGroup = document.getElementById('priceGroup');
            priceGroup.style.display = e.target.value === 'LIMIT' ? 'block' : 'none';
        });
        
        // Chart symbol change
        const chartSymbol = document.getElementById('chartSymbol');
        chartSymbol.addEventListener('change', (e) => {
            this.updateChart(e.target.value);
        });
        
        // Control buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            const btn = document.getElementById('pauseBtn');
            btn.textContent = this.isPaused ? '▶️' : '⏸️';
            btn.title = this.isPaused ? 'Resume Updates' : 'Pause Updates';
            this.showNotification('Market Data', this.isPaused ? 'Updates paused' : 'Updates resumed', 'info');
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshMarketData();
        });
        
        // AI Analysis request
        document.getElementById('requestAnalysisBtn').addEventListener('click', () => {
            this.requestAIAnalysis();
        });
    }
    
    setupChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: 'rgb(74, 111, 165)',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    updateConnectionStatus(status) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        statusDot.className = `status-dot status-${status}`;
        statusText.textContent = status === 'online' ? 'Connected' : 'Disconnected';
    }
    
    updateMarketGrid() {
        const grid = document.getElementById('marketGrid');
        grid.innerHTML = '';
        
        for (const [symbol, data] of this.marketData) {
            const symbolElement = this.createMarketSymbolElement(data);
            grid.appendChild(symbolElement);
        }
    }
    
    createMarketSymbolElement(data) {
        const div = document.createElement('div');
        div.className = 'market-symbol animate-fade-in';
        div.onclick = () => this.selectSymbolForTrading(data.symbol);
        
        const changeClass = data.changePercent >= 0 ? 'change-positive' : 'change-negative';
        const changeIcon = data.changePercent >= 0 ? '↗' : '↘';
        
        div.innerHTML = `
            <div class="symbol-header">
                <span class="symbol-name">${data.symbol}</span>
                <span class="symbol-change ${changeClass}">
                    ${changeIcon} ${data.changePercent?.toFixed(2) || '0.00'}%
                </span>
            </div>
            <div class="symbol-price">$${data.price?.toFixed(2) || '0.00'}</div>
            <div class="symbol-details">
                <span>Bid: $${data.bid?.toFixed(2) || '0.00'}</span>
                <span>Ask: $${data.ask?.toFixed(2) || '0.00'}</span>
                <span>Volume: ${(data.volume || 0).toLocaleString()}</span>
                <span>24h Range: $${data.low24h?.toFixed(2) || '0.00'} - $${data.high24h?.toFixed(2) || '0.00'}</span>
            </div>
        `;
        
        return div;
    }
    
    populateSymbolSelect() {
        const select = document.getElementById('symbolSelect');
        const chartSelect = document.getElementById('chartSymbol');
        
        // Clear existing options (except first)
        select.innerHTML = '<option value="">Select Symbol</option>';
        chartSelect.innerHTML = '';
        
        for (const [symbol] of this.marketData) {
            const option = new Option(symbol, symbol);
            const chartOption = new Option(symbol, symbol);
            select.appendChild(option);
            chartSelect.appendChild(chartOption);
        }
    }
    
    selectSymbolForTrading(symbol) {
        document.getElementById('symbolSelect').value = symbol;
        document.getElementById('chartSymbol').value = symbol;
        this.updateChart(symbol);
        this.showNotification('Symbol Selected', `Selected ${symbol} for trading`, 'info');
    }
    
    updateChart(symbol = null) {
        if (!symbol) {
            symbol = document.getElementById('chartSymbol').value || 'AAPL';
        }
        
        const data = this.marketData.get(symbol);
        if (!data || !data.trades) return;
        
        const recentTrades = data.trades.slice(-20); // Last 20 trades
        const labels = recentTrades.map(trade => new Date(trade.timestamp).toLocaleTimeString());
        const prices = recentTrades.map(trade => trade.price);
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = prices;
        this.chart.data.datasets[0].label = `${symbol} Price`;
        this.chart.update('none'); // No animation for real-time updates
    }
    
    async placeOrder() {
        const form = document.getElementById('orderForm');
        const formData = new FormData(form);
        
        const orderData = {
            symbol: document.getElementById('symbolSelect').value,
            side: document.getElementById('sideSelect').value,
            quantity: parseFloat(document.getElementById('quantityInput').value),
            orderType: document.getElementById('orderTypeSelect').value,
            price: document.getElementById('orderTypeSelect').value === 'LIMIT' ? 
                   parseFloat(document.getElementById('priceInput').value) : null
        };
        
        if (!orderData.symbol || !orderData.quantity) {
            this.showNotification('Invalid Order', 'Please fill in all required fields', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            
            const order = await response.json();
            console.log('📋 Order placed:', order.id);
            
            // Clear form
            form.reset();
            document.getElementById('priceGroup').style.display = 'none';
            
            this.showNotification('Order Placed', `${order.side} ${order.quantity} ${order.symbol} order submitted`, 'success');
            
        } catch (error) {
            console.error('❌ Error placing order:', error);
            this.showNotification('Order Error', 'Failed to place order', 'error');
        }
    }
    
    updateOrdersList() {
        const list = document.getElementById('ordersList');
        const orders = Array.from(this.orders.values()).sort((a, b) => b.timestamp - a.timestamp);
        
        if (orders.length === 0) {
            list.innerHTML = '<div class="no-orders body-small text-center opacity-75 p-8">No active orders</div>';
            return;
        }
        
        list.innerHTML = orders.map(order => `
            <div class="order-item ${order.side.toLowerCase()} animate-slide-in">
                <div class="order-header">
                    <span class="order-symbol">${order.symbol}</span>
                    <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div class="order-details body-small">
                    ${order.side} ${order.quantity} @ ${order.orderType === 'MARKET' ? 'Market' : '$' + order.price?.toFixed(2)}
                    ${order.executionPrice ? `(Filled @ $${order.executionPrice.toFixed(2)})` : ''}
                </div>
                <div class="order-time caption">${new Date(order.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    updateTradesList() {
        const list = document.getElementById('tradesList');
        const trades = Array.from(this.trades.values()).sort((a, b) => b.timestamp - a.timestamp);
        
        if (trades.length === 0) {
            list.innerHTML = '<div class="no-trades body-small text-center opacity-75 p-8">No trades yet - place your first order to start trading!</div>';
            return;
        }
        
        list.innerHTML = trades.slice(0, 10).map(trade => `
            <div class="trade-item ${trade.side.toLowerCase()} animate-slide-in">
                <div class="order-header">
                    <span class="order-symbol">${trade.symbol}</span>
                    <span class="body-small">$${trade.price.toFixed(2)}</span>
                </div>
                <div class="order-details body-small">
                    ${trade.side} ${trade.quantity} shares
                </div>
                <div class="order-time caption">${new Date(trade.timestamp).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    updateAISpecialistsPanel() {
        const panel = document.getElementById('aiSpecialists');
        panel.innerHTML = Object.entries(this.aiSpecialists).map(([key, specialist]) => `
            <div class="ai-specialist animate-fade-in">
                <div class="specialist-name">${specialist.name}</div>
                <div class="specialist-status">${specialist.status}</div>
            </div>
        `).join('');
    }
    
    requestAIAnalysis() {
        if (!this.socket) return;
        
        // Request both risk analysis and trading strategy
        this.socket.emit('request_ai_analysis', {
            type: 'risk_analysis',
            portfolio: { positions: Array.from(this.trades.values()) }
        });
        
        setTimeout(() => {
            this.socket.emit('request_ai_analysis', {
                type: 'trading_strategy',
                portfolio: { positions: Array.from(this.trades.values()) }
            });
        }, 1000);
        
        this.showNotification('AI Analysis', '🧠 Requesting AI team analysis...', 'info');
    }
    
    displayAIInsight(analysis) {
        const container = document.getElementById('aiInsights');
        
        // Clear placeholder if it exists
        const placeholder = container.querySelector('.insight-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        const insightDiv = document.createElement('div');
        insightDiv.className = 'ai-insight animate-slide-in';
        insightDiv.innerHTML = `
            <div class="insight-header">
                <span class="insight-type">${analysis.type?.replace('_', ' ') || 'AI Analysis'}</span>
                <span class="insight-timestamp">${new Date(analysis.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="body-text">
                ${analysis.reasoning || analysis.recommendation || 'AI analysis complete'}
            </div>
            ${analysis.targets ? `
                <div class="mt-4">
                    <strong>Recommendations:</strong>
                    <ul class="mt-2">
                        ${analysis.targets.map(target => `
                            <li class="body-small">${target.symbol}: ${target.action} - ${target.reasoning}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            ${analysis.riskScore ? `
                <div class="mt-4">
                    <strong>Risk Score:</strong> ${analysis.riskScore.toFixed(1)}%
                    <div class="mt-2 body-small">Recommendation: ${analysis.recommendation}</div>
                </div>
            ` : ''}
        `;
        
        container.insertBefore(insightDiv, container.firstChild);
        
        // Keep only last 5 insights
        const insights = container.querySelectorAll('.ai-insight');
        if (insights.length > 5) {
            insights[insights.length - 1].remove();
        }
    }
    
    refreshMarketData() {
        if (this.socket) {
            this.socket.emit('subscribe_market_data', Array.from(this.marketData.keys()));
            this.showNotification('Market Data', '🔄 Refreshing market data...', 'info');
        }
    }
    
    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notifications');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="body-small">${message}</div>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize the Revolutionary Trading System when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('💎 Starting Revolutionary Trading System by Krin & Mandy...');
    window.tradingSystem = new RevolutionaryTradingSystem();
});

// Export for other modules
window.RevolutionaryTradingSystem = RevolutionaryTradingSystem;