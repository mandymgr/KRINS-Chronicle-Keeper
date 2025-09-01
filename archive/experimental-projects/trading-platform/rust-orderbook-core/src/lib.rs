use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use dashmap::DashMap;
use smallvec::SmallVec;
use parking_lot::RwLock;
use std::sync::atomic::{AtomicU64, AtomicU32, Ordering};
use std::sync::Arc;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    
    #[wasm_bindgen(js_namespace = ["window", "performance"])]
    fn now() -> f64;
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum OrderSide {
    Buy = "Buy",
    Sell = "Sell",
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[wasm_bindgen] 
pub enum OrderType {
    Market = "Market",
    Limit = "Limit",
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Order {
    pub id: u64,
    pub symbol: String,
    pub side: OrderSide,
    pub order_type: OrderType,
    pub quantity: f64,
    pub price: f64,
    pub timestamp: f64,
    pub user_id: u32,
}

#[wasm_bindgen]
impl Order {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: u64,
        symbol: String,
        side: OrderSide,
        order_type: OrderType,
        quantity: f64,
        price: f64,
        user_id: u32,
    ) -> Order {
        Order {
            id,
            symbol,
            side,
            order_type,
            quantity,
            price,
            timestamp: now(),
            user_id,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trade {
    pub id: u64,
    pub symbol: String,
    pub buy_order_id: u64,
    pub sell_order_id: u64,
    pub price: f64,
    pub quantity: f64,
    pub timestamp: f64,
}

type PriceLevel = SmallVec<[Order; 8]>;

#[derive(Debug)]
pub struct OrderBook {
    symbol: String,
    bids: DashMap<u64, PriceLevel>, // price -> orders
    asks: DashMap<u64, PriceLevel>, // price -> orders
    orders: DashMap<u64, Order>,
    next_trade_id: AtomicU64,
    total_volume: AtomicU64,
    last_price: RwLock<f64>,
    best_bid: RwLock<f64>,
    best_ask: RwLock<f64>,
}

impl OrderBook {
    pub fn new(symbol: String) -> Self {
        OrderBook {
            symbol,
            bids: DashMap::new(),
            asks: DashMap::new(),
            orders: DashMap::new(),
            next_trade_id: AtomicU64::new(1),
            total_volume: AtomicU64::new(0),
            last_price: RwLock::new(0.0),
            best_bid: RwLock::new(0.0),
            best_ask: RwLock::new(f64::MAX),
        }
    }

    fn price_to_key(&self, price: f64) -> u64 {
        (price * 10000.0) as u64 // 4 decimal precision
    }

    fn key_to_price(&self, key: u64) -> f64 {
        key as f64 / 10000.0
    }

    pub fn add_order(&self, order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let order_id = order.id;
        
        match order.side {
            OrderSide::Buy => {
                if order.order_type == OrderType::Market {
                    trades.extend(self.match_market_buy(order));
                } else {
                    trades.extend(self.match_limit_buy(order));
                }
            }
            OrderSide::Sell => {
                if order.order_type == OrderType::Market {
                    trades.extend(self.match_market_sell(order));
                } else {
                    trades.extend(self.match_limit_sell(order));
                }
            }
        }

        if self.orders.contains_key(&order_id) {
            self.update_best_prices();
        }

        trades
    }

    fn match_market_buy(&self, mut order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let mut remaining_qty = order.quantity;

        // Sort asks by price (ascending)
        let mut sorted_asks: Vec<_> = self.asks.iter().collect();
        sorted_asks.sort_by(|a, b| a.key().cmp(b.key()));

        for ask_entry in sorted_asks {
            if remaining_qty <= 0.0 {
                break;
            }

            let price_key = *ask_entry.key();
            let price = self.key_to_price(price_key);
            
            let mut orders_at_level = ask_entry.value().clone();
            let mut new_level = SmallVec::new();

            for mut sell_order in orders_at_level.drain(..) {
                if remaining_qty <= 0.0 {
                    new_level.push(sell_order);
                    continue;
                }

                let trade_qty = remaining_qty.min(sell_order.quantity);
                
                trades.push(Trade {
                    id: self.next_trade_id.fetch_add(1, Ordering::SeqCst),
                    symbol: order.symbol.clone(),
                    buy_order_id: order.id,
                    sell_order_id: sell_order.id,
                    price,
                    quantity: trade_qty,
                    timestamp: now(),
                });

                remaining_qty -= trade_qty;
                sell_order.quantity -= trade_qty;
                
                *self.last_price.write() = price;
                self.total_volume.fetch_add(trade_qty as u64, Ordering::SeqCst);

                if sell_order.quantity > 0.0 {
                    new_level.push(sell_order);
                } else {
                    self.orders.remove(&sell_order.id);
                }
            }

            if new_level.is_empty() {
                self.asks.remove(&price_key);
            } else {
                self.asks.insert(price_key, new_level);
            }
        }

        if remaining_qty > 0.0 {
            console_log!("Market buy order {} partially filled, {} remaining", order.id, remaining_qty);
        }

        trades
    }

    fn match_market_sell(&self, mut order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let mut remaining_qty = order.quantity;

        // Sort bids by price (descending)
        let mut sorted_bids: Vec<_> = self.bids.iter().collect();
        sorted_bids.sort_by(|a, b| b.key().cmp(a.key()));

        for bid_entry in sorted_bids {
            if remaining_qty <= 0.0 {
                break;
            }

            let price_key = *bid_entry.key();
            let price = self.key_to_price(price_key);
            
            let mut orders_at_level = bid_entry.value().clone();
            let mut new_level = SmallVec::new();

            for mut buy_order in orders_at_level.drain(..) {
                if remaining_qty <= 0.0 {
                    new_level.push(buy_order);
                    continue;
                }

                let trade_qty = remaining_qty.min(buy_order.quantity);
                
                trades.push(Trade {
                    id: self.next_trade_id.fetch_add(1, Ordering::SeqCst),
                    symbol: order.symbol.clone(),
                    buy_order_id: buy_order.id,
                    sell_order_id: order.id,
                    price,
                    quantity: trade_qty,
                    timestamp: now(),
                });

                remaining_qty -= trade_qty;
                buy_order.quantity -= trade_qty;
                
                *self.last_price.write() = price;
                self.total_volume.fetch_add(trade_qty as u64, Ordering::SeqCst);

                if buy_order.quantity > 0.0 {
                    new_level.push(buy_order);
                } else {
                    self.orders.remove(&buy_order.id);
                }
            }

            if new_level.is_empty() {
                self.bids.remove(&price_key);
            } else {
                self.bids.insert(price_key, new_level);
            }
        }

        trades
    }

    fn match_limit_buy(&self, order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let mut remaining_order = order.clone();

        // Match against existing asks
        let mut sorted_asks: Vec<_> = self.asks.iter().collect();
        sorted_asks.sort_by(|a, b| a.key().cmp(b.key()));

        for ask_entry in sorted_asks {
            let price_key = *ask_entry.key();
            let ask_price = self.key_to_price(price_key);
            
            if ask_price > remaining_order.price {
                break; // No more matching asks
            }

            if remaining_order.quantity <= 0.0 {
                break;
            }

            let mut orders_at_level = ask_entry.value().clone();
            let mut new_level = SmallVec::new();

            for mut sell_order in orders_at_level.drain(..) {
                if remaining_order.quantity <= 0.0 {
                    new_level.push(sell_order);
                    continue;
                }

                let trade_qty = remaining_order.quantity.min(sell_order.quantity);
                
                trades.push(Trade {
                    id: self.next_trade_id.fetch_add(1, Ordering::SeqCst),
                    symbol: remaining_order.symbol.clone(),
                    buy_order_id: remaining_order.id,
                    sell_order_id: sell_order.id,
                    price: ask_price,
                    quantity: trade_qty,
                    timestamp: now(),
                });

                remaining_order.quantity -= trade_qty;
                sell_order.quantity -= trade_qty;
                
                *self.last_price.write() = ask_price;
                self.total_volume.fetch_add(trade_qty as u64, Ordering::SeqCst);

                if sell_order.quantity > 0.0 {
                    new_level.push(sell_order);
                } else {
                    self.orders.remove(&sell_order.id);
                }
            }

            if new_level.is_empty() {
                self.asks.remove(&price_key);
            } else {
                self.asks.insert(price_key, new_level);
            }
        }

        // Add remaining quantity to order book
        if remaining_order.quantity > 0.0 {
            let price_key = self.price_to_key(remaining_order.price);
            self.orders.insert(remaining_order.id, remaining_order.clone());
            
            let mut level = self.bids.entry(price_key).or_insert_with(SmallVec::new);
            level.push(remaining_order);
        }

        trades
    }

    fn match_limit_sell(&self, order: Order) -> Vec<Trade> {
        let mut trades = Vec::new();
        let mut remaining_order = order.clone();

        // Match against existing bids
        let mut sorted_bids: Vec<_> = self.bids.iter().collect();
        sorted_bids.sort_by(|a, b| b.key().cmp(a.key()));

        for bid_entry in sorted_bids {
            let price_key = *bid_entry.key();
            let bid_price = self.key_to_price(price_key);
            
            if bid_price < remaining_order.price {
                break; // No more matching bids
            }

            if remaining_order.quantity <= 0.0 {
                break;
            }

            let mut orders_at_level = bid_entry.value().clone();
            let mut new_level = SmallVec::new();

            for mut buy_order in orders_at_level.drain(..) {
                if remaining_order.quantity <= 0.0 {
                    new_level.push(buy_order);
                    continue;
                }

                let trade_qty = remaining_order.quantity.min(buy_order.quantity);
                
                trades.push(Trade {
                    id: self.next_trade_id.fetch_add(1, Ordering::SeqCst),
                    symbol: remaining_order.symbol.clone(),
                    buy_order_id: buy_order.id,
                    sell_order_id: remaining_order.id,
                    price: bid_price,
                    quantity: trade_qty,
                    timestamp: now(),
                });

                remaining_order.quantity -= trade_qty;
                buy_order.quantity -= trade_qty;
                
                *self.last_price.write() = bid_price;
                self.total_volume.fetch_add(trade_qty as u64, Ordering::SeqCst);

                if buy_order.quantity > 0.0 {
                    new_level.push(buy_order);
                } else {
                    self.orders.remove(&buy_order.id);
                }
            }

            if new_level.is_empty() {
                self.bids.remove(&price_key);
            } else {
                self.bids.insert(price_key, new_level);
            }
        }

        // Add remaining quantity to order book
        if remaining_order.quantity > 0.0 {
            let price_key = self.price_to_key(remaining_order.price);
            self.orders.insert(remaining_order.id, remaining_order.clone());
            
            let mut level = self.asks.entry(price_key).or_insert_with(SmallVec::new);
            level.push(remaining_order);
        }

        trades
    }

    fn update_best_prices(&self) {
        // Update best bid
        if let Some(best_bid_entry) = self.bids.iter().max_by_key(|entry| *entry.key()) {
            *self.best_bid.write() = self.key_to_price(*best_bid_entry.key());
        } else {
            *self.best_bid.write() = 0.0;
        }

        // Update best ask
        if let Some(best_ask_entry) = self.asks.iter().min_by_key(|entry| *entry.key()) {
            *self.best_ask.write() = self.key_to_price(*best_ask_entry.key());
        } else {
            *self.best_ask.write() = f64::MAX;
        }
    }

    pub fn get_spread(&self) -> f64 {
        let best_ask = *self.best_ask.read();
        let best_bid = *self.best_bid.read();
        
        if best_ask == f64::MAX || best_bid == 0.0 {
            0.0
        } else {
            best_ask - best_bid
        }
    }
}

#[wasm_bindgen]
pub struct TradingEngine {
    orderbooks: DashMap<String, Arc<OrderBook>>,
    next_order_id: AtomicU64,
    processed_orders: AtomicU64,
    total_trades: AtomicU64,
}

#[wasm_bindgen]
impl TradingEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TradingEngine {
        console_error_panic_hook::set_once();
        
        console_log!("🚀 Trading Engine initialized - Ready for 1M tx/sec!");
        
        TradingEngine {
            orderbooks: DashMap::new(),
            next_order_id: AtomicU64::new(1),
            processed_orders: AtomicU64::new(0),
            total_trades: AtomicU64::new(0),
        }
    }

    #[wasm_bindgen]
    pub fn add_symbol(&self, symbol: &str) {
        let orderbook = Arc::new(OrderBook::new(symbol.to_string()));
        self.orderbooks.insert(symbol.to_string(), orderbook);
        console_log!("📈 Added orderbook for symbol: {}", symbol);
    }

    #[wasm_bindgen]
    pub fn place_order(
        &self,
        symbol: &str,
        side: OrderSide,
        order_type: OrderType,
        quantity: f64,
        price: f64,
        user_id: u32,
    ) -> String {
        let start_time = now();
        
        if let Some(orderbook) = self.orderbooks.get(symbol) {
            let order_id = self.next_order_id.fetch_add(1, Ordering::SeqCst);
            
            let order = Order::new(
                order_id,
                symbol.to_string(),
                side,
                order_type,
                quantity,
                price,
                user_id,
            );

            let trades = orderbook.add_order(order);
            
            self.processed_orders.fetch_add(1, Ordering::SeqCst);
            self.total_trades.fetch_add(trades.len() as u64, Ordering::SeqCst);
            
            let processing_time = now() - start_time;
            
            if processing_time > 1.0 {
                console_log!("⚠️  Slow order processing: {:.3}ms for order {}", processing_time, order_id);
            }

            serde_wasm_bindgen::to_value(&trades).unwrap().as_string().unwrap_or_default()
        } else {
            format!("Error: Symbol {} not found", symbol)
        }
    }

    #[wasm_bindgen]
    pub fn get_orderbook(&self, symbol: &str) -> String {
        if let Some(orderbook) = self.orderbooks.get(symbol) {
            let mut bids: Vec<_> = orderbook.bids
                .iter()
                .map(|entry| {
                    let price = orderbook.key_to_price(*entry.key());
                    let total_qty: f64 = entry.value().iter().map(|o| o.quantity).sum();
                    (price, total_qty, entry.value().len())
                })
                .collect();
            bids.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());

            let mut asks: Vec<_> = orderbook.asks
                .iter()
                .map(|entry| {
                    let price = orderbook.key_to_price(*entry.key());
                    let total_qty: f64 = entry.value().iter().map(|o| o.quantity).sum();
                    (price, total_qty, entry.value().len())
                })
                .collect();
            asks.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

            let data = serde_json::json!({
                "symbol": symbol,
                "bids": bids.into_iter().take(20).collect::<Vec<_>>(),
                "asks": asks.into_iter().take(20).collect::<Vec<_>>(),
                "last_price": *orderbook.last_price.read(),
                "spread": orderbook.get_spread(),
                "total_volume": orderbook.total_volume.load(Ordering::SeqCst)
            });

            data.to_string()
        } else {
            format!("{{\"error\": \"Symbol {} not found\"}}", symbol)
        }
    }

    #[wasm_bindgen]
    pub fn get_stats(&self) -> String {
        let stats = serde_json::json!({
            "processed_orders": self.processed_orders.load(Ordering::SeqCst),
            "total_trades": self.total_trades.load(Ordering::SeqCst),
            "active_symbols": self.orderbooks.len(),
            "timestamp": now()
        });
        
        stats.to_string()
    }

    #[wasm_bindgen]
    pub fn benchmark_performance(&self, iterations: u32) -> String {
        console_log!("🚀 Starting performance benchmark with {} iterations", iterations);
        
        let start = now();
        
        for i in 0..iterations {
            let _ = self.place_order(
                "BTCUSD",
                if i % 2 == 0 { OrderSide::Buy } else { OrderSide::Sell },
                OrderType::Limit,
                1.0,
                50000.0 + (i as f64 * 0.01),
                i % 1000,
            );
        }
        
        let end = now();
        let total_time = end - start;
        let avg_time = total_time / iterations as f64;
        let orders_per_second = (iterations as f64 / total_time) * 1000.0;
        
        let benchmark = serde_json::json!({
            "iterations": iterations,
            "total_time_ms": total_time,
            "avg_time_microseconds": avg_time * 1000.0,
            "orders_per_second": orders_per_second,
            "target_achieved": orders_per_second >= 1_000_000.0
        });
        
        console_log!("✅ Benchmark complete: {:.0} orders/sec (target: 1M/sec)", orders_per_second);
        
        benchmark.to_string()
    }
}