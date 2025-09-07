# Microservices Architecture Patterns

## Overview
Architectural patterns for designing, implementing, and operating microservices-based systems with focus on scalability, resilience, and maintainability.

## Pattern: API Gateway with Service Discovery

```yaml
# API Gateway Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
data:
  gateway.yml: |
    server:
      port: 8080
    
    spring:
      cloud:
        gateway:
          routes:
            - id: user-service
              uri: lb://user-service
              predicates:
                - Path=/api/users/**
              filters:
                - StripPrefix=2
                - AddRequestHeader=X-Service-Name,user-service
                - name: CircuitBreaker
                  args:
                    name: user-service-cb
                    fallbackUri: forward:/fallback/users
            
            - id: order-service  
              uri: lb://order-service
              predicates:
                - Path=/api/orders/**
              filters:
                - StripPrefix=2
                - AddRequestHeader=X-Service-Name,order-service
                - name: RateLimiter
                  args:
                    redis-rate-limiter.replenishRate: 10
                    redis-rate-limiter.burstCapacity: 20
```

## Pattern: Event-Driven Architecture with CQRS

```typescript
// Command Side - Write Model
interface CreateOrderCommand {
  customerId: string;
  items: OrderItem[];
  shippingAddress: Address;
}

class OrderCommandHandler {
  constructor(
    private orderRepository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: CreateOrderCommand): Promise<void> {
    const order = new Order(
      command.customerId,
      command.items,
      command.shippingAddress
    );

    await this.orderRepository.save(order);

    // Publish domain events
    const events = order.getUncommittedEvents();
    await this.eventBus.publishAll(events);
    order.markEventsAsCommitted();
  }
}

// Query Side - Read Model
interface OrderView {
  id: string;
  customerId: string;
  status: string;
  totalAmount: number;
  items: OrderItemView[];
  createdAt: Date;
}

class OrderProjection {
  constructor(private readDatabase: ReadDatabase) {}

  async on(event: OrderCreatedEvent): Promise<void> {
    const orderView: OrderView = {
      id: event.orderId,
      customerId: event.customerId,
      status: 'PENDING',
      totalAmount: event.totalAmount,
      items: event.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      createdAt: event.occurredAt
    };

    await this.readDatabase.orders.create(orderView);
  }

  async on(event: OrderStatusChangedEvent): Promise<void> {
    await this.readDatabase.orders.update(
      { id: event.orderId },
      { status: event.newStatus }
    );
  }
}
```

## Pattern: Circuit Breaker with Bulkhead Isolation

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;
  timeoutMs: number;
  resetTimeoutMs: number;
  monitoringPeriodMs: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN', 
  HALF_OPEN = 'HALF_OPEN'
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: Date | null = null;
  private nextAttemptTime: Date | null = null;

  constructor(
    private config: CircuitBreakerConfig,
    private metrics: MetricsCollector
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.metrics.recordCircuitBreakerStateChange(this.state);
      } else {
        throw new CircuitBreakerOpenError();
      }
    }

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new TimeoutError()), this.config.timeoutMs)
      )
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    this.metrics.recordCircuitBreakerSuccess();
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeoutMs);
      this.metrics.recordCircuitBreakerOpen();
    }
    
    this.metrics.recordCircuitBreakerFailure();
  }

  private isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime !== null && 
           new Date() >= this.nextAttemptTime;
  }
}
```

## Pattern: Saga Pattern for Distributed Transactions

```typescript
interface SagaStep {
  action: () => Promise<void>;
  compensate: () => Promise<void>;
}

class OrderSaga {
  private steps: SagaStep[] = [];
  private executedSteps: SagaStep[] = [];

  constructor(
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private notificationService: NotificationService
  ) {
    this.defineSteps();
  }

  async execute(orderData: OrderData): Promise<void> {
    try {
      for (const step of this.steps) {
        await step.action();
        this.executedSteps.push(step);
      }
    } catch (error) {
      await this.compensate();
      throw new SagaExecutionError('Order saga failed', error);
    }
  }

  private async compensate(): Promise<void> {
    // Execute compensation in reverse order
    for (let i = this.executedSteps.length - 1; i >= 0; i--) {
      try {
        await this.executedSteps[i].compensate();
      } catch (compensationError) {
        // Log compensation failure but continue
        console.error('Compensation failed:', compensationError);
      }
    }
  }

  private defineSteps(): void {
    this.steps = [
      {
        action: async () => {
          await this.paymentService.reservePayment(this.orderData.paymentInfo);
        },
        compensate: async () => {
          await this.paymentService.releasePayment(this.orderData.paymentInfo);
        }
      },
      {
        action: async () => {
          await this.inventoryService.reserveItems(this.orderData.items);
        },
        compensate: async () => {
          await this.inventoryService.releaseItems(this.orderData.items);
        }
      },
      {
        action: async () => {
          await this.shippingService.createShipment(this.orderData.shippingInfo);
        },
        compensate: async () => {
          await this.shippingService.cancelShipment(this.orderData.shippingInfo);
        }
      },
      {
        action: async () => {
          await this.notificationService.sendOrderConfirmation(this.orderData);
        },
        compensate: async () => {
          await this.notificationService.sendOrderCancellation(this.orderData);
        }
      }
    ];
  }
}
```

## Pattern: Service Mesh with Istio

```yaml
# Virtual Service for Canary Deployment
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service-vs
spec:
  hosts:
  - user-service
  http:
  - match:
    - headers:
        x-canary:
          exact: "true"
    route:
    - destination:
        host: user-service
        subset: v2
      weight: 100
  - route:
    - destination:
        host: user-service
        subset: v1
      weight: 90
    - destination:
        host: user-service
        subset: v2
      weight: 10

---
# Destination Rule
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service-dr
spec:
  host: user-service
  trafficPolicy:
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
```

## Pattern: Distributed Tracing and Observability

```typescript
class OrderService {
  constructor(
    private tracer: Tracer,
    private metrics: MetricsCollector,
    private logger: Logger
  ) {}

  @Traced('order-service.create-order')
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const span = this.tracer.startSpan('create-order');
    const timer = this.metrics.startTimer('order_creation_duration');
    
    try {
      span.setAttributes({
        'order.customer_id': orderData.customerId,
        'order.item_count': orderData.items.length,
        'order.total_amount': orderData.totalAmount
      });

      this.logger.info('Creating order', {
        customerId: orderData.customerId,
        correlationId: span.spanContext().traceId
      });

      // Business logic
      const order = await this.processOrder(orderData);
      
      span.setStatus({ code: SpanStatusCode.OK });
      this.metrics.incrementCounter('orders_created_total');
      
      return order;
    } catch (error) {
      span.recordException(error);
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      
      this.metrics.incrementCounter('orders_creation_errors_total', {
        error_type: error.constructor.name
      });
      
      throw error;
    } finally {
      timer.end();
      span.end();
    }
  }
}
```

## Anti-Patterns

### ❌ Avoid: Distributed Monolith
```typescript
// Bad - tight coupling between services
class OrderService {
  async createOrder(orderData: OrderData) {
    // Synchronous calls to multiple services
    const user = await this.userService.getUser(orderData.userId);
    const product = await this.productService.getProduct(orderData.productId);
    const payment = await this.paymentService.processPayment(orderData.payment);
    const shipping = await this.shippingService.createShipment(orderData.shipping);
    
    // If any service is down, order creation fails
  }
}

// Good - event-driven with eventual consistency
class OrderService {
  async createOrder(orderData: OrderData) {
    const order = new Order(orderData);
    await this.orderRepository.save(order);
    
    // Publish event for other services to react
    await this.eventBus.publish(new OrderCreatedEvent(order));
  }
}
```

### ❌ Avoid: Shared Database
```sql
-- Bad - multiple services sharing same database
Services: [UserService, OrderService, ProductService] → Database

-- Good - database per service  
UserService → UserDatabase
OrderService → OrderDatabase  
ProductService → ProductDatabase
```

## Best Practices

1. **Database per Service** - Each service owns its data
2. **Event-driven Communication** - Prefer async messaging over sync calls
3. **Circuit Breaker Pattern** - Prevent cascade failures
4. **Distributed Tracing** - Track requests across services
5. **Service Mesh** - Handle cross-cutting concerns
6. **Saga Pattern** - Handle distributed transactions
7. **API Versioning** - Maintain backward compatibility

## Deployment Patterns

### Blue-Green Deployment
```bash
# Deploy new version to green environment
kubectl apply -f green-deployment.yaml

# Test green environment
kubectl port-forward service/app-green 8080:80

# Switch traffic to green
kubectl patch service app -p '{"spec":{"selector":{"version":"green"}}}'

# Cleanup blue environment after verification
kubectl delete deployment app-blue
```

### Canary Deployment with Istio
```yaml
# Gradually shift traffic from v1 to v2
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: canary-deployment
spec:
  http:
  - route:
    - destination:
        host: app-service
        subset: v1
      weight: 95
    - destination:
        host: app-service  
        subset: v2
      weight: 5
```

## Related ADRs
- ADR-003: Microservices Communication Patterns
- ADR-010: Event Sourcing Implementation
- ADR-018: Service Mesh Adoption Strategy

## Last Updated
2025-09-07