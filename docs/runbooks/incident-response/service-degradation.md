# Service Degradation Response

## Description
Response procedure for service performance degradation, high latency, or partial service failures.

## Prerequisites
- Access to APM (Application Performance Monitoring) tools
- Service monitoring dashboard access
- Deployment pipeline access
- Understanding of service dependencies

## Steps

1. **Initial Triage**
   - Check service health endpoints and status pages
   - Review APM dashboard for latency, error rate, and throughput metrics
   - Identify affected service components and user impact scope
   - Determine if degradation is gradual or sudden

2. **Impact Assessment**
   - Quantify user impact (affected users, failed requests)
   - Check downstream service dependencies
   - Assess critical business function impact
   - Determine if emergency rollback is needed

3. **Quick Mitigation**
   - Enable circuit breakers to protect downstream services
   - Activate rate limiting if overload detected
   - Scale horizontally if resource constraints identified
   - Route traffic to healthy instances if partial failure

4. **Diagnosis**
   - Check recent deployments and configuration changes
   - Review resource utilization (CPU, memory, network, disk)
   - Analyze error logs and exception patterns
   - Examine external service dependencies

5. **Resolution Actions**
   - Rollback recent deployment if deployment-related
   - Apply hotfix for code-related issues
   - Adjust resource limits or scaling policies
   - Restart problematic service instances

6. **Monitoring & Verification**
   - Monitor key metrics for 15-30 minutes post-fix
   - Verify user-facing functionality is restored
   - Check that downstream services have recovered
   - Confirm alert conditions have cleared

## Severity Levels

### P1 - Critical (RTO: 15 minutes)
- Service completely unavailable
- Critical business functions affected
- Major customer-facing impact

### P2 - High (RTO: 1 hour)
- Significant performance degradation
- Some features unavailable
- Customer experience impacted

### P3 - Medium (RTO: 4 hours)
- Minor performance issues
- Non-critical features affected
- Minimal customer impact

## Communication
- P1: Immediate stakeholder notification + status page update
- P2: Stakeholder notification within 15 minutes
- P3: Include in next scheduled status update

## Related ADRs
- ADR-0011: Service level objectives and error budgets
- ADR-0012: Incident response and communication protocols