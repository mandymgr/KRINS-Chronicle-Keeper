# Database Maintenance Procedures

## Description
Scheduled maintenance procedures for database health, including index maintenance, statistics updates, and performance optimization.

## Prerequisites
- Database admin access
- Maintenance window scheduled
- Application deployment capability for connection draining
- Database backup verified and available

## Steps

### Weekly Maintenance

1. **Pre-Maintenance Checklist**
   - Verify recent backup completion and integrity
   - Check current database size and growth trends
   - Review query performance reports from past week
   - Notify stakeholders of maintenance window

2. **Index Maintenance**
   ```sql
   -- Check index fragmentation
   SELECT 
       schemaname, tablename, indexname, 
       idx_blks_read, idx_blks_hit,
       idx_blks_hit * 100.0 / (idx_blks_read + idx_blks_hit) as hit_ratio
   FROM pg_statio_user_indexes 
   WHERE idx_blks_read > 0
   ORDER BY hit_ratio;
   
   -- Rebuild heavily fragmented indexes
   REINDEX INDEX CONCURRENTLY index_name;
   ```

3. **Statistics Update**
   ```sql
   -- Update table statistics for query planner
   ANALYZE;
   
   -- Check for tables with stale statistics
   SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
   FROM pg_stat_user_tables
   WHERE last_analyze < now() - interval '7 days';
   ```

4. **Space Management**
   - Check table and index sizes
   - Identify candidates for archiving or partitioning
   - Clean up temporary tables and old log entries
   - Vacuum tables with high update/delete activity

### Monthly Maintenance

1. **Performance Review**
   - Analyze slow query logs
   - Review connection pool statistics
   - Check for missing or unused indexes
   - Evaluate query execution plans

2. **Configuration Tuning**
   - Review and adjust connection limits
   - Optimize memory allocation parameters
   - Update autovacuum settings based on workload
   - Check and adjust log retention policies

3. **Security Maintenance**
   - Review user permissions and roles
   - Update passwords for service accounts
   - Check for unnecessary database objects
   - Review and rotate backup encryption keys

## Rollback Procedures

If issues arise during maintenance:

1. **Stop current maintenance operations**
2. **Restore from pre-maintenance backup if necessary**
3. **Verify application connectivity and functionality**
4. **Document issues encountered for future reference**

## Validation Checklist

After maintenance completion:

- [ ] All critical queries executing within expected time
- [ ] Connection pool operating normally
- [ ] Application health checks passing
- [ ] No error spikes in application logs
- [ ] Database metrics within expected ranges
- [ ] Backup processes working correctly

## Related ADRs
- ADR-0002: Database architecture and pgvector usage
- ADR-0013: Database maintenance and monitoring procedures