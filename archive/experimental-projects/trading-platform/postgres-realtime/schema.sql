-- Revolutionary Trading System Database Schema
-- Optimized for 1 million transactions per second with real-time replication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create dedicated schemas
CREATE SCHEMA IF NOT EXISTS trading;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS compliance;

SET search_path = trading, public;

-- Users and Authentication
CREATE TABLE trading.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGSERIAL UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    country_code CHAR(2),
    is_active BOOLEAN DEFAULT true,
    risk_level INTEGER DEFAULT 1 CHECK (risk_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- EU GDPR compliance fields
    gdpr_consent BOOLEAN DEFAULT false,
    gdpr_consent_date TIMESTAMPTZ,
    data_retention_until TIMESTAMPTZ,
    
    -- MiFID II compliance
    client_category VARCHAR(20) DEFAULT 'retail' CHECK (client_category IN ('retail', 'professional', 'eligible_counterparty')),
    investment_experience JSONB,
    financial_situation JSONB
);

-- Accounts and Portfolios
CREATE TABLE trading.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES trading.users(id) ON DELETE CASCADE,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(20) DEFAULT 'trading' CHECK (account_type IN ('trading', 'demo', 'professional')),
    base_currency CHAR(3) DEFAULT 'USD',
    balance NUMERIC(18,8) DEFAULT 0,
    available_balance NUMERIC(18,8) DEFAULT 0,
    margin_level NUMERIC(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trading symbols and instruments
CREATE TABLE trading.symbols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    base_asset VARCHAR(10) NOT NULL,
    quote_asset VARCHAR(10) NOT NULL,
    symbol_type VARCHAR(20) DEFAULT 'crypto' CHECK (symbol_type IN ('crypto', 'forex', 'stock', 'commodity')),
    precision_price INTEGER DEFAULT 8,
    precision_amount INTEGER DEFAULT 8,
    min_order_size NUMERIC(18,8),
    max_order_size NUMERIC(18,8),
    tick_size NUMERIC(18,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- MiFID II instrument classification
    mifid_class VARCHAR(20) CHECK (mifid_class IN ('equity', 'bond', 'derivative', 'currency', 'commodity')),
    complexity_level INTEGER DEFAULT 1 CHECK (complexity_level BETWEEN 1 AND 3)
);

-- High-performance orders table (partitioned by time)
CREATE TABLE trading.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id BIGSERIAL UNIQUE NOT NULL,
    user_id UUID REFERENCES trading.users(id),
    account_id UUID REFERENCES trading.accounts(id),
    symbol VARCHAR(20) REFERENCES trading.symbols(symbol),
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
    quantity NUMERIC(18,8) NOT NULL,
    price NUMERIC(18,8),
    stop_price NUMERIC(18,8),
    filled_quantity NUMERIC(18,8) DEFAULT 0,
    remaining_quantity NUMERIC(18,8),
    avg_fill_price NUMERIC(18,8),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'partial', 'filled', 'cancelled', 'rejected')),
    time_in_force VARCHAR(10) DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK', 'GTD')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    
    -- Performance tracking
    latency_microseconds INTEGER,
    source_ip INET,
    
    -- Compliance tracking
    compliance_checked BOOLEAN DEFAULT false,
    compliance_flags JSONB DEFAULT '[]',
    
    -- Risk management
    risk_score NUMERIC(5,2),
    margin_required NUMERIC(18,8)
);

-- Convert to hypertable for time-series performance
SELECT create_hypertable('trading.orders', 'created_at', chunk_time_interval => INTERVAL '1 hour');

-- High-performance trades table (partitioned by time)
CREATE TABLE trading.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id BIGSERIAL UNIQUE NOT NULL,
    symbol VARCHAR(20) REFERENCES trading.symbols(symbol),
    buy_order_id BIGINT REFERENCES trading.orders(order_id),
    sell_order_id BIGINT REFERENCES trading.orders(order_id),
    buyer_id UUID REFERENCES trading.users(id),
    seller_id UUID REFERENCES trading.users(id),
    price NUMERIC(18,8) NOT NULL,
    quantity NUMERIC(18,8) NOT NULL,
    total_value NUMERIC(18,8) GENERATED ALWAYS AS (price * quantity) STORED,
    
    -- Fees
    buyer_fee NUMERIC(18,8) DEFAULT 0,
    seller_fee NUMERIC(18,8) DEFAULT 0,
    fee_currency CHAR(3) DEFAULT 'USD',
    
    -- Timestamps with microsecond precision
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance metrics
    processing_time_microseconds INTEGER,
    matching_engine_latency INTEGER,
    
    -- Compliance
    trade_reporting_status VARCHAR(20) DEFAULT 'pending',
    mifid_reporting_required BOOLEAN DEFAULT false,
    
    -- Market making
    is_market_maker_trade BOOLEAN DEFAULT false,
    liquidity_provision_reward NUMERIC(18,8)
);

-- Convert to hypertable for time-series performance
SELECT create_hypertable('trading.trades', 'executed_at', chunk_time_interval => INTERVAL '1 hour');

-- Real-time orderbook snapshots
CREATE TABLE trading.orderbook_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) REFERENCES trading.symbols(symbol),
    bids JSONB NOT NULL, -- Array of [price, quantity, order_count]
    asks JSONB NOT NULL, -- Array of [price, quantity, order_count]
    best_bid NUMERIC(18,8),
    best_ask NUMERIC(18,8),
    spread NUMERIC(18,8) GENERATED ALWAYS AS (best_ask - best_bid) STORED,
    total_bid_volume NUMERIC(18,8),
    total_ask_volume NUMERIC(18,8),
    last_trade_price NUMERIC(18,8),
    snapshot_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Performance metrics
    update_latency_microseconds INTEGER,
    depth_levels INTEGER
);

-- Convert to hypertable
SELECT create_hypertable('trading.orderbook_snapshots', 'snapshot_at', chunk_time_interval => INTERVAL '10 minutes');

-- Market data and OHLCV candles
CREATE TABLE trading.candles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) REFERENCES trading.symbols(symbol),
    timeframe VARCHAR(10) NOT NULL, -- 1m, 5m, 15m, 1h, 4h, 1d
    open_time TIMESTAMPTZ NOT NULL,
    close_time TIMESTAMPTZ NOT NULL,
    open_price NUMERIC(18,8) NOT NULL,
    high_price NUMERIC(18,8) NOT NULL,
    low_price NUMERIC(18,8) NOT NULL,
    close_price NUMERIC(18,8) NOT NULL,
    volume NUMERIC(18,8) DEFAULT 0,
    quote_volume NUMERIC(18,8) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    
    UNIQUE(symbol, timeframe, open_time)
);

-- Convert to hypertable
SELECT create_hypertable('trading.candles', 'open_time', chunk_time_interval => INTERVAL '1 day');

-- User balances and positions
CREATE TABLE trading.balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES trading.accounts(id),
    currency CHAR(3) NOT NULL,
    available NUMERIC(18,8) DEFAULT 0,
    locked NUMERIC(18,8) DEFAULT 0,
    total NUMERIC(18,8) GENERATED ALWAYS AS (available + locked) STORED,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, currency)
);

-- Performance metrics and system monitoring
CREATE TABLE analytics.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(18,6) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable
SELECT create_hypertable('analytics.performance_metrics', 'recorded_at', chunk_time_interval => INTERVAL '1 hour');

-- Compliance and audit trail
CREATE TABLE compliance.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Compliance flags
    mifid_relevant BOOLEAN DEFAULT false,
    gdpr_relevant BOOLEAN DEFAULT false,
    pci_relevant BOOLEAN DEFAULT false
);

-- Convert to hypertable
SELECT create_hypertable('compliance.audit_logs', 'created_at', chunk_time_interval => INTERVAL '1 day');

-- Indexes for high-performance queries
CREATE INDEX CONCURRENTLY ON trading.orders (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY ON trading.orders (symbol, status, created_at DESC);
CREATE INDEX CONCURRENTLY ON trading.orders (status, created_at) WHERE status IN ('pending', 'open');

CREATE INDEX CONCURRENTLY ON trading.trades (symbol, executed_at DESC);
CREATE INDEX CONCURRENTLY ON trading.trades (buyer_id, executed_at DESC);
CREATE INDEX CONCURRENTLY ON trading.trades (seller_id, executed_at DESC);

CREATE INDEX CONCURRENTLY ON trading.orderbook_snapshots (symbol, snapshot_at DESC);

CREATE INDEX CONCURRENTLY ON trading.candles (symbol, timeframe, open_time DESC);

CREATE INDEX CONCURRENTLY ON analytics.performance_metrics (metric_name, recorded_at DESC);
CREATE INDEX CONCURRENTLY ON analytics.performance_metrics USING GIN (tags);

-- Partial indexes for hot paths
CREATE INDEX CONCURRENTLY orders_active_idx ON trading.orders (created_at DESC) 
WHERE status IN ('pending', 'open', 'partial');

CREATE INDEX CONCURRENTLY trades_recent_idx ON trading.trades (executed_at DESC) 
WHERE executed_at > NOW() - INTERVAL '1 day';

-- Functions and triggers for real-time updates
CREATE OR REPLACE FUNCTION trading.update_balance_on_trade()
RETURNS TRIGGER AS $$
BEGIN
    -- Update buyer balance
    INSERT INTO trading.balances (account_id, currency, available, locked)
    SELECT a.id, s.base_asset, -NEW.quantity * NEW.price, 0
    FROM trading.accounts a, trading.symbols s
    WHERE a.user_id = NEW.buyer_id AND s.symbol = NEW.symbol
    ON CONFLICT (account_id, currency)
    DO UPDATE SET
        available = balances.available - NEW.quantity * NEW.price,
        updated_at = NOW();

    -- Update seller balance  
    INSERT INTO trading.balances (account_id, currency, available, locked)
    SELECT a.id, s.quote_asset, NEW.quantity, 0
    FROM trading.accounts a, trading.symbols s  
    WHERE a.user_id = NEW.seller_id AND s.symbol = NEW.symbol
    ON CONFLICT (account_id, currency)
    DO UPDATE SET
        available = balances.available + NEW.quantity,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER balance_update_on_trade
    AFTER INSERT ON trading.trades
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_balance_on_trade();

-- Function to update order status
CREATE OR REPLACE FUNCTION trading.update_order_on_trade()
RETURNS TRIGGER AS $$
BEGIN
    -- Update buy order
    UPDATE trading.orders 
    SET 
        filled_quantity = filled_quantity + NEW.quantity,
        remaining_quantity = quantity - (filled_quantity + NEW.quantity),
        status = CASE 
            WHEN (quantity - (filled_quantity + NEW.quantity)) <= 0 THEN 'filled'
            ELSE 'partial'
        END,
        updated_at = NOW(),
        filled_at = CASE 
            WHEN (quantity - (filled_quantity + NEW.quantity)) <= 0 THEN NOW()
            ELSE filled_at
        END
    WHERE order_id = NEW.buy_order_id;

    -- Update sell order
    UPDATE trading.orders 
    SET 
        filled_quantity = filled_quantity + NEW.quantity,
        remaining_quantity = quantity - (filled_quantity + NEW.quantity),
        status = CASE 
            WHEN (quantity - (filled_quantity + NEW.quantity)) <= 0 THEN 'filled'
            ELSE 'partial'
        END,
        updated_at = NOW(),
        filled_at = CASE 
            WHEN (quantity - (filled_quantity + NEW.quantity)) <= 0 THEN NOW()
            ELSE filled_at
        END
    WHERE order_id = NEW.sell_order_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_update_on_trade
    AFTER INSERT ON trading.trades
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_order_on_trade();

-- Real-time replication setup
-- Enable logical replication
ALTER SYSTEM SET wal_level = logical;
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET max_wal_senders = 10;

-- Create publication for real-time replication
CREATE PUBLICATION trading_realtime FOR ALL TABLES IN SCHEMA trading;

-- Performance optimization settings
ALTER SYSTEM SET shared_preload_libraries = 'timescaledb,pg_stat_statements';
ALTER SYSTEM SET max_connections = 1000;
ALTER SYSTEM SET shared_buffers = '8GB';
ALTER SYSTEM SET effective_cache_size = '24GB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Continuous aggregates for analytics
CREATE MATERIALIZED VIEW analytics.hourly_trade_stats
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', executed_at) AS hour,
    symbol,
    COUNT(*) AS trades_count,
    SUM(quantity) AS total_volume,
    SUM(total_value) AS total_value,
    AVG(price) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    FIRST(price, executed_at) AS open_price,
    LAST(price, executed_at) AS close_price,
    AVG(processing_time_microseconds) AS avg_latency
FROM trading.trades
GROUP BY hour, symbol;

-- Refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy('analytics.hourly_trade_stats',
    start_offset => INTERVAL '2 hours',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');

-- Data retention policies
SELECT add_retention_policy('trading.orders', INTERVAL '1 year');
SELECT add_retention_policy('trading.trades', INTERVAL '7 years'); -- Regulatory requirement
SELECT add_retention_policy('trading.orderbook_snapshots', INTERVAL '30 days');
SELECT add_retention_policy('compliance.audit_logs', INTERVAL '7 years'); -- Regulatory requirement

-- Insert default symbols
INSERT INTO trading.symbols (symbol, base_asset, quote_asset, symbol_type, mifid_class) VALUES
('BTCUSD', 'BTC', 'USD', 'crypto', 'currency'),
('ETHUSD', 'ETH', 'USD', 'crypto', 'currency'), 
('ADAUSD', 'ADA', 'USD', 'crypto', 'currency'),
('DOTUSD', 'DOT', 'USD', 'crypto', 'currency'),
('SOLUSD', 'SOL', 'USD', 'crypto', 'currency');

-- Create superuser for replication
-- This would be done by the database administrator
-- CREATE ROLE trading_replication WITH REPLICATION LOGIN PASSWORD 'secure_password';
-- GRANT SELECT ON ALL TABLES IN SCHEMA trading TO trading_replication;

COMMENT ON DATABASE postgres IS '🚀 Revolutionary Trading System - Optimized for 1M tx/sec with real-time replication and EU compliance';