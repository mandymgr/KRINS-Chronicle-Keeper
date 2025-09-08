# Application Performance Troubleshooting

## Description
Systematic approach to diagnosing and resolving application performance issues including high latency, memory leaks, and CPU utilization problems.

## Prerequisites
- Access to APM tools (New Relic, DataDog, or similar)
- Profiling tools available
- Log aggregation system access
- Understanding of application architecture

## Steps

### High Latency Issues

1. **Identify Latency Source**
   - Check endpoint-specific response times in APM
   - Look for database query performance degradation
   - Examine external service call latencies
   - Review recent code deployments

2. **Database Performance**
   ```sql
   -- Find slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   
   -- Check for blocking queries
   SELECT blocked_locks.pid AS blocked_pid,
          blocked_activity.usename AS blocked_user,
          blocking_locks.pid AS blocking_pid,
          blocking_activity.usename AS blocking_user,
          blocked_activity.query AS blocked_statement,
          blocking_activity.query AS current_statement_in_blocking_process
   FROM pg_catalog.pg_locks blocked_locks
   JOIN pg_catalog.pg_stat_activity blocked_activity
     ON blocked_activity.pid = blocked_locks.pid
   JOIN pg_catalog.pg_locks blocking_locks 
     ON blocking_locks.locktype = blocked_locks.locktype;
   ```

3. **Application Code Analysis**
   - Enable profiling for CPU and memory usage
   - Check for N+1 query problems
   - Look for inefficient loops or algorithms
   - Examine caching effectiveness

### Memory Issues

1. **Memory Leak Detection**
   - Monitor heap usage trends over time
   - Check for growing object counts in heap dumps
   - Look for unclosed resources (connections, streams, files)
   - Review garbage collection patterns and frequency

2. **Immediate Mitigation**
   - Restart affected service instances
   - Increase memory limits temporarily
   - Enable more aggressive garbage collection
   - Reduce concurrent request limits

3. **Root Cause Analysis**
   - Take heap dumps before and after problem operations
   - Analyze object retention graphs
   - Check for static collections growing unbounded
   - Review third-party library usage

### CPU Performance

1. **CPU Utilization Analysis**
   - Identify CPU-intensive endpoints or operations
   - Check for inefficient algorithms or loops
   - Look for excessive synchronization or locking
   - Examine thread pool utilization

2. **Optimization Strategies**
   - Implement caching for expensive operations
   - Optimize database queries and indexes
   - Consider async processing for heavy operations
   - Review and optimize hot code paths

## Common Performance Patterns

### Database-Related
- **Symptom:** Gradual performance degradation
- **Cause:** Missing or deteriorating indexes
- **Solution:** Analyze query plans and add appropriate indexes

### Memory-Related  
- **Symptom:** Periodic service restarts due to OOM
- **Cause:** Memory leaks or excessive caching
- **Solution:** Implement proper resource cleanup and cache size limits

### Integration-Related
- **Symptom:** High latency during business hours
- **Cause:** External service timeouts or rate limiting
- **Solution:** Implement circuit breakers and caching

## Performance Testing

After implementing fixes:

1. **Load Testing**
   - Run performance tests with realistic load
   - Measure key metrics (response time, throughput, error rate)
   - Verify resource utilization remains within acceptable limits

2. **Monitoring**
   - Set up alerts for performance regressions
   - Monitor key metrics for 24-48 hours
   - Compare before and after performance metrics

## Related ADRs
- ADR-0014: Application performance monitoring standards
- ADR-0015: Caching strategy and implementation