# Database Service Pattern

## Description
Standardized pattern for database service classes with connection pooling, error handling, and type safety.

## Usage
Use this pattern for all database interaction services to ensure consistent error handling and connection management.

## Code

```typescript
import { Pool, PoolClient } from 'pg';

export abstract class BaseRepository<T> {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  protected async withTransaction<R>(
    callback: (client: PoolClient) => Promise<R>
  ): Promise<R> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  protected async query<T>(
    text: string, 
    params?: any[]
  ): Promise<T[]> {
    try {
      const result = await this.pool.query(text, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new DatabaseError('Query execution failed', error);
    }
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

## Related ADRs
- ADR-0002: Bruke pgvector for semantikk-søk
- ADR-0003: Database connection pooling strategy