# Python Async Patterns

## Overview
Asynchronous programming patterns in Python using asyncio, focusing on performance, scalability, and maintainability.

## Pattern: Async Service with Connection Pool

```python
import asyncio
import aiohttp
from typing import AsyncIterator, Dict, List, Optional
from contextlib import asynccontextmanager

class HTTPService:
    def __init__(self, base_url: str, pool_limit: int = 10):
        self.base_url = base_url
        self.pool_limit = pool_limit
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        connector = aiohttp.TCPConnector(limit=self.pool_limit)
        self._session = aiohttp.ClientSession(
            connector=connector,
            base_url=self.base_url
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()

    async def get(self, path: str) -> Dict:
        if not self._session:
            raise RuntimeError("Service not initialized")
        
        async with self._session.get(path) as response:
            response.raise_for_status()
            return await response.json()

    async def post(self, path: str, data: Dict) -> Dict:
        if not self._session:
            raise RuntimeError("Service not initialized")
            
        async with self._session.post(path, json=data) as response:
            response.raise_for_status()
            return await response.json()
```

## Pattern: Async Iterator for Batch Processing

```python
class DataProcessor:
    def __init__(self, batch_size: int = 100):
        self.batch_size = batch_size

    async def process_items_async(
        self, 
        items: List[Dict]
    ) -> AsyncIterator[Dict]:
        """Process items in batches asynchronously."""
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            tasks = [self._process_single_item(item) for item in batch]
            results = await asyncio.gather(*tasks)
            
            for result in results:
                if result:
                    yield result

    async def _process_single_item(self, item: Dict) -> Optional[Dict]:
        """Process a single item with error handling."""
        try:
            # Simulate async processing
            await asyncio.sleep(0.1)
            return {
                'id': item['id'],
                'processed': True,
                'timestamp': asyncio.get_event_loop().time()
            }
        except Exception as e:
            print(f"Error processing item {item.get('id')}: {e}")
            return None
```

## Pattern: Async Context Manager for Resources

```python
import asyncpg
from typing import AsyncContextManager

class DatabasePool:
    def __init__(self, dsn: str, min_connections: int = 1, max_connections: int = 10):
        self.dsn = dsn
        self.min_connections = min_connections
        self.max_connections = max_connections
        self._pool: Optional[asyncpg.Pool] = None

    @asynccontextmanager
    async def get_connection(self) -> AsyncContextManager[asyncpg.Connection]:
        """Get a connection from the pool with automatic cleanup."""
        if not self._pool:
            self._pool = await asyncpg.create_pool(
                self.dsn,
                min_size=self.min_connections,
                max_size=self.max_connections
            )
        
        async with self._pool.acquire() as connection:
            yield connection

    async def execute_query(self, query: str, *args) -> List[Dict]:
        """Execute a query and return results."""
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, *args)
            return [dict(row) for row in rows]

    async def close(self):
        """Close the connection pool."""
        if self._pool:
            await self._pool.close()
```

## Pattern: Async Task Queue with Worker Pool

```python
import asyncio
from asyncio import Queue
from typing import Any, Callable, Coroutine
import logging

class AsyncTaskQueue:
    def __init__(self, num_workers: int = 3):
        self.num_workers = num_workers
        self.queue: Queue = Queue()
        self.workers: List[asyncio.Task] = []
        self.running = False

    async def start(self):
        """Start the worker pool."""
        self.running = True
        self.workers = [
            asyncio.create_task(self._worker(f"worker-{i}"))
            for i in range(self.num_workers)
        ]

    async def stop(self):
        """Stop the worker pool gracefully."""
        self.running = False
        
        # Add sentinel values to wake up workers
        for _ in range(self.num_workers):
            await self.queue.put(None)
        
        # Wait for workers to finish
        await asyncio.gather(*self.workers, return_exceptions=True)

    async def add_task(self, coro: Coroutine[Any, Any, Any]):
        """Add a coroutine to the task queue."""
        await self.queue.put(coro)

    async def _worker(self, name: str):
        """Worker coroutine that processes tasks from the queue."""
        while self.running:
            try:
                task = await self.queue.get()
                if task is None:  # Sentinel value to stop
                    break
                
                await task
                self.queue.task_done()
                
            except Exception as e:
                logging.error(f"Worker {name} error: {e}")
```

## Anti-Patterns

### ❌ Avoid: Blocking calls in async functions
```python
# Bad
async def bad_async_function():
    result = requests.get("https://api.example.com")  # Blocking!
    return result.json()

# Good
async def good_async_function():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.example.com") as response:
            return await response.json()
```

### ❌ Avoid: Creating tasks without cleanup
```python
# Bad
async def bad_task_creation():
    for i in range(1000):
        asyncio.create_task(some_coro())  # No cleanup!

# Good
async def good_task_creation():
    tasks = []
    for i in range(1000):
        task = asyncio.create_task(some_coro())
        tasks.append(task)
    
    try:
        await asyncio.gather(*tasks)
    except Exception:
        for task in tasks:
            task.cancel()
        raise
```

## Best Practices

1. **Use async context managers** for resource management
2. **Implement proper error handling** in async functions
3. **Limit concurrency** to prevent overwhelming resources
4. **Use asyncio.gather()** for concurrent execution
5. **Always close resources** in async contexts
6. **Prefer structured concurrency** with nurseries/task groups

## Performance Tips

- Use connection pooling for HTTP clients
- Batch database operations when possible
- Implement backpressure for high-throughput scenarios
- Monitor event loop performance

## Related ADRs
- ADR-008: Async Database Layer Architecture
- ADR-022: HTTP Client Standards

## Last Updated
2025-09-07