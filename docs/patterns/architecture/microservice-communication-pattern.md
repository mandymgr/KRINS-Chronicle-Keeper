# Microservice Communication Pattern

## Description
Standardized patterns for inter-service communication including synchronous REST, asynchronous messaging, and circuit breaker implementation.

## Usage
Use these patterns for all microservice-to-microservice communication to ensure reliability, observability, and fault tolerance.

## Code

```yaml
# Service Discovery & Load Balancing
apiVersion: v1
kind: Service
metadata:
  name: user-service
  labels:
    app: user-service
    version: v1
spec:
  selector:
    app: user-service
  ports:
  - port: 8080
    targetPort: 8080
  type: ClusterIP

---
# Circuit Breaker Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: circuit-breaker-config
data:
  application.yml: |
    resilience4j:
      circuitbreaker:
        instances:
          user-service:
            failure-rate-threshold: 50
            wait-duration-in-open-state: 30s
            sliding-window-size: 10
            minimum-number-of-calls: 5
          order-service:
            failure-rate-threshold: 60
            wait-duration-in-open-state: 20s
            sliding-window-size: 8
      retry:
        instances:
          user-service:
            max-attempts: 3
            wait-duration: 2s
          order-service:
            max-attempts: 2
            wait-duration: 1s

---
# Async Messaging Pattern
apiVersion: apps/v1
kind: Deployment
metadata:
  name: event-processor
spec:
  template:
    spec:
      containers:
      - name: event-processor
        image: event-processor:v1
        env:
        - name: KAFKA_BROKERS
          value: "kafka:9092"
        - name: CONSUMER_GROUP
          value: "order-processor-group"
        - name: TOPICS
          value: "order.created,order.updated,payment.completed"
```

```typescript
// TypeScript Service Communication Client
export class ServiceClient {
  private readonly httpClient: HttpClient;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly logger: Logger;

  constructor(
    private readonly serviceName: string,
    private readonly baseUrl: string,
    private readonly config: ServiceClientConfig
  ) {
    this.httpClient = new HttpClient(baseUrl, config.timeout);
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
    this.logger = new Logger(`ServiceClient:${serviceName}`);
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.executeWithFallback(
      () => this.httpClient.get<T>(path, options),
      options?.fallback
    );
  }

  async post<T>(path: string, data: any, options?: RequestOptions): Promise<T> {
    return this.executeWithFallback(
      () => this.httpClient.post<T>(path, data, options),
      options?.fallback
    );
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    try {
      return await this.circuitBreaker.execute(operation);
    } catch (error) {
      this.logger.error(`Service call failed for ${this.serviceName}`, error);
      
      if (fallback) {
        this.logger.info('Executing fallback strategy');
        return await fallback();
      }
      
      throw new ServiceCommunicationError(
        `Failed to communicate with ${this.serviceName}`,
        error
      );
    }
  }

  // Event Publishing
  async publishEvent<T>(eventType: string, payload: T): Promise<void> {
    const event = {
      id: generateEventId(),
      type: eventType,
      source: this.serviceName,
      timestamp: new Date().toISOString(),
      data: payload,
      version: '1.0'
    };

    await this.eventPublisher.publish(eventType, event);
    this.logger.info(`Published event ${eventType}`, { eventId: event.id });
  }
}

// Event Handler Pattern
export abstract class EventHandler<T = any> {
  abstract readonly eventType: string;
  abstract readonly version: string;

  abstract handle(event: DomainEvent<T>): Promise<void>;

  protected async withErrorHandling(
    operation: () => Promise<void>
  ): Promise<void> {
    try {
      await operation();
    } catch (error) {
      await this.handleError(error);
      throw error;
    }
  }

  protected abstract handleError(error: Error): Promise<void>;
}

interface DomainEvent<T> {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: T;
  version: string;
}
```

## Related ADRs
- ADR-0007: Microservice communication standards
- ADR-0008: Event-driven architecture implementation
- ADR-0009: Circuit breaker and resilience patterns