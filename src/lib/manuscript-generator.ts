// ── Seeded PRNG (Mulberry32) ──────────────────────────────────────────────────

function hashSeed(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(31, h) + input.charCodeAt(i) | 0
  }
  return Math.abs(h) || 1
}

function mulberry32(seed: number) {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function createRng(studentId: string) {
  return mulberry32(hashSeed(studentId))
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pickN<T>(rng: () => number, arr: T[], n: number): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(n, shuffled.length))
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ManuscriptElement =
  | { type: "heading"; text: string; level: number }
  | { type: "paragraph"; text: string; highlight?: { criterionId: number; confidence: number } }
  | { type: "code"; language: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "bulletList"; items: string[] }
  | { type: "numberedList"; items: string[] }
  | { type: "blockQuote"; text: string; source?: string }
  | { type: "diagram"; diagramType: "er" | "flowchart" | "architecture"; label: string }

export interface GeneratedManuscript {
  title: string
  pages: { elements: ManuscriptElement[] }[]
}

export type ArtifactType = "pdf" | "docx" | "pptx" | "video" | "link" | "code" | "image"

export interface StudentArtifact {
  id: string
  name: string
  type: ArtifactType
  size: string
  isPrimary: boolean
  previewContent?: string
}

// ── Title Fragments ───────────────────────────────────────────────────────────

const TITLE_ADJECTIVES = [
  "A Comprehensive", "An Empirical", "A Critical", "A Systematic",
  "A Comparative", "A Pragmatic", "A Scalable", "An Adaptive",
  "A Resilient", "A Modular", "A Distributed", "A Robust",
]

const TITLE_TOPICS = [
  "Software Architecture for Enterprise Systems",
  "Design Pattern Implementation in Modern Web Applications",
  "Microservices Communication Strategies",
  "MVC and MVVM Patterns in Full-Stack Development",
  "Dependency Injection and Inversion of Control",
  "API Design Principles for RESTful Services",
  "Test-Driven Development in Agile Workflows",
  "CI/CD Pipeline Architecture and Automation",
  "Containerization Strategies with Docker and Kubernetes",
  "Event-Driven Architecture for Real-Time Systems",
  "Layered Architecture in Domain-Driven Design",
  "Middleware Patterns in Distributed Computing",
  "Database Schema Design for Normalized Systems",
  "Authentication and Authorization in Service Meshes",
  "Observability Patterns in Cloud-Native Applications",
]

const TITLE_APPROACHES = [
  "A Case Study Approach",
  "An Implementation Perspective",
  "Theory and Practice",
  "Lessons from Production Systems",
  "A Pattern-Based Analysis",
  "From Requirements to Deployment",
  "A Performance Evaluation",
  "Best Practices and Anti-Patterns",
]

// ── Page 1: System Architecture & Design Patterns (Q1) ────────────────────────

const P1_PARAGRAPHS: { text: string; highlightable?: { criterionId: number; confidence: number } }[] = [
  {
    text: "The system architecture follows a strict separation of concerns, ensuring that the presentation layer, business logic, and data access layers operate independently. This decoupling allows for independent scaling and testing of each component, reducing the risk of cascading failures across the system.",
    highlightable: { criterionId: 1, confidence: 0.92 },
  },
  {
    text: "By adopting the Model-View-Controller paradigm, we enforce a unidirectional data flow where user interactions are captured by the Controller, processed by the Model, and reflected in the View. This pattern significantly reduces state management complexity in large-scale applications.",
    highlightable: { criterionId: 1, confidence: 0.87 },
  },
  {
    text: "The application leverages a layered architecture where each tier communicates only with its immediate neighbors. The presentation tier handles HTTP request routing, the application tier encapsulates business rules, and the persistence tier manages database transactions through an ORM abstraction.",
    highlightable: { criterionId: 1, confidence: 0.78 },
  },
  {
    text: "Microservices decomposition was chosen over a monolithic approach to enable independent deployment cycles. Each service owns its data store and communicates via asynchronous message queues, reducing temporal coupling between domains.",
    highlightable: { criterionId: 2, confidence: 0.85 },
  },
  {
    text: "The initial prototype was built as a single deployable unit, but after identifying bounded contexts through domain-driven design workshops, the team iteratively extracted services. This incremental refactoring approach minimized disruption to existing functionality while improving system modularity.",
    highlightable: { criterionId: 2, confidence: 0.91 },
  },
  {
    text: "Dependency injection is applied at the composition root, allowing concrete implementations to be swapped without modifying dependent modules. This facilitates unit testing through mock substitution and supports the open-closed principle for extending system behavior.",
    highlightable: { criterionId: 3, confidence: 0.88 },
  },
  {
    text: "The repository pattern abstracts data access behind generic interfaces, enabling the domain layer to remain agnostic of the underlying storage technology. This abstraction proved critical when migrating from a relational database to a document store mid-project.",
    highlightable: { criterionId: 3, confidence: 0.83 },
  },
  {
    text: "We employed the observer pattern to implement real-time event propagation across services. When an order is placed, the inventory service, notification service, and analytics pipeline are all notified through a centralized event bus without direct service-to-service calls.",
    highlightable: { criterionId: 4, confidence: 0.79 },
  },
  {
    text: "The strategy pattern is used extensively for algorithm selection at runtime. Payment processing, for instance, delegates to a strategy implementation based on the provider type, allowing new payment gateways to be added without modifying existing code paths.",
    highlightable: { criterionId: 4, confidence: 0.74 },
  },
  {
    text: "Hexagonal architecture principles were applied to isolate the domain core from external concerns. Ports define the contract for inbound and outbound interactions, while adapters provide framework-specific implementations, ensuring the business logic remains testable in isolation.",
    highlightable: { criterionId: 1, confidence: 0.81 },
  },
  {
    text: "Circuit breaker patterns were introduced at service boundaries after observing cascading failures during peak load. The Hystrix-inspired implementation monitors failure thresholds and opens the circuit to prevent downstream overload, with automatic recovery through periodic health checks.",
    highlightable: { criterionId: 2, confidence: 0.76 },
  },
  {
    text: "The system originally used a shared database anti-pattern, which created tight coupling between services. After refactoring to a database-per-service model, each microservice could evolve its schema independently, reducing coordination overhead during deployments.",
    highlightable: { criterionId: 2, confidence: 0.94 },
  },
  {
    text: "Interface segregation was enforced throughout the codebase, ensuring that no client depends on methods it does not use. This resulted in finer-grained interfaces that are easier to implement and test, particularly in the notification and reporting subsystems.",
    highlightable: { criterionId: 3, confidence: 0.72 },
  },
  {
    text: "The facade pattern simplifies interaction with complex subsystems. A PaymentFacade exposes a single charge() method that internally orchestrains fraud detection, card tokenization, gateway routing, and receipt generation, shielding the caller from implementation complexity.",
    highlightable: { criterionId: 4, confidence: 0.86 },
  },
  {
    text: "Event sourcing captures all state changes as an immutable sequence of events. This allows the system to reconstruct any past state for debugging or auditing, and enables CQRS read models that are optimized for specific query patterns without impacting write performance.",
    highlightable: { criterionId: 1, confidence: 0.69 },
  },
]

const P1_CODE_BLOCKS = [
  {
    language: "TypeScript",
    code: `// Composition Root - Dependency Injection Setup
const container = new Container();

container.bind<IPaymentService>("PaymentService")
  .to(StripePaymentService);
container.bind<IInventoryRepo>("InventoryRepo")
  .to(PostgresInventoryRepo);
container.bind<INotifier>("Notifier")
  .to(SlackNotifier);

const orderService = container.resolve(OrderService);`,
  },
  {
    language: "TypeScript",
    code: `// Observer Pattern - Event Bus Implementation
class EventBus {
  private handlers: Map<string, Function[]> = new Map();

  subscribe(event: string, handler: Function) {
    if (!this.handlers.has(event))
      this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  emit(event: string, payload: any) {
    this.handlers.get(event)?.forEach(h => h(payload));
  }
}`,
  },
  {
    language: "Python",
    code: `# Strategy Pattern - Payment Processing
class PaymentProcessor:
    def __init__(self, strategy: PaymentStrategy):
        self._strategy = strategy

    def process(self, amount: float) -> Receipt:
        return self._strategy.charge(amount)

class StripeStrategy(PaymentStrategy):
    def charge(self, amount: float) -> Receipt:
        return stripe.Charge.create(amount=int(amount * 100))`,
  },
  {
    language: "YAML",
    code: `# Docker Compose - Service Orchestration
services:
  api-gateway:
    image: org/api-gateway:latest
    ports: ["8080:8080"]
    depends_on: [user-service, order-service]
  
  user-service:
    image: org/user-svc:latest
    environment:
      DB_URL: postgres://users-db:5432/users
  
  order-service:
    image: org/order-svc:latest
    environment:
      DB_URL: postgres://orders-db:5432/orders`,
  },
]

const P1_TABLES: { headers: string[]; rows: string[][]; caption?: string }[] = [
  {
    headers: ["Pattern", "Layer", "Coupling", "Testability"],
    rows: [
      ["MVC", "Presentation", "Low", "High"],
      ["Repository", "Persistence", "Low", "High"],
      ["Facade", "Application", "Medium", "Medium"],
      ["Observer", "Cross-cutting", "Low", "High"],
      ["Strategy", "Business", "Low", "High"],
    ],
    caption: "Table 1: Design Pattern Classification by Architectural Layer",
  },
  {
    headers: ["Service", "Database", "Protocol", "Team"],
    rows: [
      ["User Service", "PostgreSQL", "REST", "Identity"],
      ["Order Service", "MongoDB", "gRPC", "Commerce"],
      ["Inventory Service", "Redis", "Async MQ", "Warehouse"],
      ["Notification Service", "None", "Event Bus", "Platform"],
    ],
    caption: "Table 2: Microservice Ownership Matrix",
  },
]

const P1_BULLET_LISTS: string[][] = [
  [
    "Enforce unidirectional data flow from Controller → Model → View",
    "Separate read models from write models using CQRS where applicable",
    "Isolate domain logic from infrastructure through hexagonal ports",
    "Use dependency injection to decouple concrete implementations",
    "Apply the repository pattern to abstract data persistence details",
  ],
  [
    "Identify bounded contexts through event storming workshops",
    "Define aggregate roots with clear consistency boundaries",
    "Establish ubiquitous language shared across domain experts and developers",
    "Map subdomains to autonomous microservices with independent lifecycles",
    "Implement anti-corruption layers at context boundaries",
  ],
]

const P1_BLOCK_QUOTES: { text: string; source?: string }[] = [
  {
    text: "The single most important attribute of a well-designed system is that it is easy to change. Architecture is the set of design decisions that are hard to change later.",
    source: "Robert C. Martin, Clean Architecture (2017)",
  },
  {
    text: "Services should be loosely coupled and highly cohesive. If changing one service requires changing another, you have coupling. If a service does many unrelated things, you lack cohesion.",
    source: "Sam Newman, Building Microservices (2015)",
  },
]

// ── Page 2: Implementation Details (Q2) ──────────────────────────────────────

const P2_PARAGRAPHS: { text: string; highlightable?: { criterionId: number; confidence: number } }[] = [
  {
    text: "The REST API follows resource-oriented conventions where each endpoint maps to a domain entity. PUT requests enforce idempotency through conditional ETag headers, while POST requests return 201 Created with a Location header pointing to the newly created resource.",
    highlightable: { criterionId: 4, confidence: 0.88 },
  },
  {
    text: "Database schema design employs third normal form for transactional tables while using denormalized materialized views for read-heavy query paths. This hybrid approach balances write consistency with read performance, reducing the need for complex JOIN operations at query time.",
    highlightable: { criterionId: 3, confidence: 0.82 },
  },
  {
    text: "Middleware pipeline processes requests through a chain of responsibility pattern. Authentication middleware validates JWT tokens, authorization middleware enforces role-based access control, and rate limiting middleware applies sliding window counters per client IP.",
    highlightable: { criterionId: 4, confidence: 0.91 },
  },
  {
    text: "The team initially used a monolithic ORM for all database operations, which led to N+1 query problems in the reporting module. After profiling, we replaced the ORM with raw SQL for complex aggregations and introduced DataLoader for batched foreign key lookups.",
    highlightable: { criterionId: 2, confidence: 0.86 },
  },
  {
    text: "Foreign key constraints and unique indexes enforce referential integrity at the database level. Cascading deletes are prohibited in favor of soft-delete flags, enabling audit trails and data recovery without compromising consistency guarantees.",
    highlightable: { criterionId: 3, confidence: 0.79 },
  },
  {
    text: "The authentication controller validates incoming JWT tokens by verifying the signature against the public key fetched from the identity provider's JWKS endpoint. Token rotation is handled automatically with a 5-minute overlap window during key transitions.",
    highlightable: { criterionId: 4, confidence: 0.93 },
  },
  {
    text: "Database migrations are managed through versioned SQL scripts executed in strict sequential order. Each migration runs within a transaction where supported, and rollback scripts are maintained for zero-downtime deployment scenarios.",
    highlightable: { criterionId: 3, confidence: 0.77 },
  },
  {
    text: "Edge cases handled in the API layer include: malformed JSON payloads with detailed validation errors, pagination boundary conditions, concurrent update conflicts resolved through optimistic locking, and graceful degradation when downstream services are unavailable.",
    highlightable: { criterionId: 2, confidence: 0.84 },
  },
  {
    text: "The event-driven integration layer uses Apache Kafka as the message broker with exactly-once delivery semantics. Consumer groups enable parallel processing while partition key routing ensures ordering guarantees within an aggregate instance.",
    highlightable: { criterionId: 4, confidence: 0.71 },
  },
  {
    text: "Connection pooling is configured with a maximum of 20 connections per service instance, with idle timeout set to 30 seconds. This prevents connection exhaustion under load while maintaining sufficient throughput for peak traffic conditions.",
    highlightable: { criterionId: 3, confidence: 0.68 },
  },
  {
    text: "The original implementation used synchronous HTTP calls for inter-service communication, resulting in a 3-second latency chain for composite operations. Refactoring to asynchronous event-driven communication reduced end-to-end latency to under 400ms for the same workflows.",
    highlightable: { criterionId: 2, confidence: 0.92 },
  },
  {
    text: "Rate limiting is implemented using a token bucket algorithm with configurable thresholds per endpoint. The public API allows 100 requests per minute, while internal service-to-service calls are limited to 1000 per minute to prevent cascade failures.",
    highlightable: { criterionId: 4, confidence: 0.75 },
  },
]

const P2_CODE_BLOCKS = [
  {
    language: "SQL",
    code: `-- Schema: Orders with Referential Integrity
CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    total       DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ  -- soft delete
);

CREATE INDEX idx_orders_user ON orders(user_id)
  WHERE deleted_at IS NULL;`,
  },
  {
    language: "TypeScript",
    code: `// Middleware Pipeline - Chain of Responsibility
const pipeline = [
  cors({ origin: ALLOWED_ORIGINS }),
  helmet(),
  rateLimit({ windowMs: 60000, max: 100 }),
  authenticate({ jwksUri: IDP_JWKS_URL }),
  authorize({ roles: ['admin', 'operator'] }),
  validate(schema.orderCreate),
  routeHandler,
];`,
  },
  {
    language: "TypeScript",
    code: `// Optimistic Locking for Concurrent Updates
async function updateOrder(id: string, patch: OrderPatch, version: number) {
  const result = await db.query(
    \`UPDATE orders SET status = $1, version = version + 1
      WHERE id = $2 AND version = $3 AND deleted_at IS NULL\`,
    [patch.status, id, version]
  );
  if (result.rowCount === 0)
    throw new ConflictError('Order was modified by another transaction');
  return result;
}`,
  },
  {
    language: "Python",
    code: `# Kafka Consumer with Exactly-Once Processing
class OrderEventConsumer:
    def __init__(self, topic: str, group: str):
        self.consumer = KafkaConsumer(
            topic,
            group_id=group,
            enable_auto_commit=False,
            isolation_level="read_committed"
        )

    def process(self):
        for msg in self.consumer:
            with transaction.atomic():
                self._handle_event(msg.value)
                self.consumer.commit()`,
  },
]

const P2_TABLES: { headers: string[]; rows: string[][]; caption?: string }[] = [
  {
    headers: ["Endpoint", "Method", "Auth", "Rate Limit"],
    rows: [
      ["/api/v1/orders", "GET", "JWT", "100/min"],
      ["/api/v1/orders", "POST", "JWT + Role", "50/min"],
      ["/api/v1/orders/:id", "PUT", "JWT + Role", "50/min"],
      ["/api/v1/orders/:id", "DELETE", "JWT + Admin", "10/min"],
      ["/api/v1/orders/search", "POST", "JWT", "30/min"],
    ],
    caption: "Table 3: API Endpoint Specification",
  },
  {
    headers: ["Table", "Indexes", "Constraints", "Soft Delete"],
    rows: [
      ["users", "email (UNIQUE)", "NOT NULL on email, role", "Yes"],
      ["orders", "user_id, status", "FK → users, CHECK total ≥ 0", "Yes"],
      ["products", "sku (UNIQUE)", "NOT NULL on name, sku", "Yes"],
      ["audit_log", "entity_type, created_at", "NOT NULL on action", "No"],
    ],
    caption: "Table 4: Database Schema Summary",
  },
]

const P2_NUMBERED_LISTS: string[][] = [
  [
    "Client sends POST /api/v1/orders with JWT in Authorization header",
    "API Gateway validates token signature against JWKS endpoint",
    "Rate limiter checks token bucket for client IP",
    "Request body is validated against JSON Schema",
    "Order service creates record with optimistic lock version=1",
    "Event emitted to Kafka topic 'order.created'",
    "Consumer groups process event for inventory and notification",
    "Client receives 201 Created with Location header",
  ],
  [
    "Run schema migration scripts in sequential order",
    "Verify all foreign key constraints are satisfied",
    "Seed reference data for lookup tables",
    "Create database users with least-privilege permissions",
    "Enable row-level security for multi-tenant isolation",
    "Configure connection pooling parameters per service",
    "Validate rollback scripts against current schema state",
  ],
]

const P2_BULLET_LISTS: string[][] = [
  [
    "All API endpoints must return standard HTTP status codes (2xx, 4xx, 5xx)",
    "Request bodies are validated against JSON Schema before processing",
    "Rate limiting is applied per client identity, not per IP address",
    "Pagination uses cursor-based navigation for large result sets",
    "Idempotency keys are required for all POST operations",
  ],
  [
    "Foreign key constraints enforce referential integrity at the database level",
    "Soft deletes preserve audit trails and enable data recovery",
    "Connection pooling prevents resource exhaustion under high concurrency",
    "Optimistic locking detects and resolves concurrent update conflicts",
    "Database migrations are versioned and run in strict sequential order",
  ],
]

const P2_BLOCK_QUOTES: { text: string; source?: string }[] = [
  {
    text: "Be conservative in what you send, be liberal in what you accept. A robust API should handle malformed input gracefully while adhering strictly to its own output contracts.",
    source: "Postel's Law (Robustness Principle)",
  },
  {
    text: "Every migration must have a rollback. If you cannot revert a database change safely, you are not ready to deploy it to production.",
    source: "Engineering Playbook, Section 4.3",
  },
]

// ── Page 3: Testing & Quality (Q3) ───────────────────────────────────────────

const P3_PARAGRAPHS: { text: string; highlightable?: { criterionId: number; confidence: number } }[] = [
  {
    text: "Unit tests cover 87% of business logic branches, with the remaining 13% comprising edge cases that are cost-prohibitive to reproduce. Test suites are organized by domain module, and each test follows the Arrange-Act-Assert pattern for consistency and readability.",
    highlightable: { criterionId: 3, confidence: 0.94 },
  },
  {
    text: "Integration tests verify end-to-end workflows by spinning up ephemeral Docker containers with real database instances. Tests run against actual PostgreSQL and Redis instances rather than mocks, ensuring that SQL queries and connection handling behave identically to production.",
    highlightable: { criterionId: 3, confidence: 0.87 },
  },
  {
    text: "The CI/CD pipeline executes the full test suite on every pull request, blocking merges if any test fails. Code coverage reports are generated using Istanbul and published as PR comments, ensuring visibility into coverage deltas for each change.",
    highlightable: { criterionId: 3, confidence: 0.82 },
  },
  {
    text: "Load tests were conducted using Locust with 500 concurrent users simulating realistic traffic patterns. The system maintained sub-200ms P95 latency under normal load, with graceful degradation observed at 3x capacity before circuit breakers activated.",
    highlightable: { criterionId: 4, confidence: 0.79 },
  },
  {
    text: "Mutation testing was introduced to evaluate test effectiveness. The Stryker framework injected 1,247 mutations into the codebase, and the test suite killed 1,089 of them, yielding an 87.3% mutation score. The surviving mutants were concentrated in logging and error formatting code.",
    highlightable: { criterionId: 2, confidence: 0.88 },
  },
  {
    text: "Contract tests between services use Pact to verify that consumers and providers agree on API schemas. Consumer-side tests generate pact files that are verified against the provider's actual API, preventing breaking changes from propagating across service boundaries.",
    highlightable: { criterionId: 4, confidence: 0.91 },
  },
  {
    text: "Code review is mandatory for all changes, with a minimum of two approvals required before merge. Reviewers check for correctness, readability, security implications, and test coverage adequacy using a standardized checklist documented in the engineering wiki.",
    highlightable: { criterionId: 3, confidence: 0.76 },
  },
  {
    text: "After the initial release, we discovered that 40% of production bugs originated from untested error handling paths. The team then systematically added failure scenario tests using chaos engineering techniques, injecting network latency and service failures in staging environments.",
    highlightable: { criterionId: 2, confidence: 0.93 },
  },
  {
    text: "Static analysis is integrated into the build pipeline through ESLint and SonarQube. The codebase maintains zero critical or major code smells, and technical debt ratio is tracked weekly as a team health metric in the sprint retrospective.",
    highlightable: { criterionId: 3, confidence: 0.73 },
  },
  {
    text: "The testing pyramid guides our investment: 60% unit tests for fast feedback, 25% integration tests for cross-module verification, and 15% end-to-end tests for critical user journeys. This distribution optimizes for both speed and confidence in the deployment pipeline.",
    highlightable: { criterionId: 3, confidence: 0.85 },
  },
  {
    text: "End-to-end tests use Playwright to simulate real user interactions across browser contexts. These tests cover the five critical user journeys identified by product management, including order placement, payment processing, and refund handling.",
    highlightable: { criterionId: 4, confidence: 0.67 },
  },
  {
    text: "Property-based testing with fast-check generates random inputs to discover edge cases that manual test design misses. This approach uncovered a timestamp parsing bug that only manifested for dates after 2038 due to integer overflow in a legacy library.",
    highlightable: { criterionId: 2, confidence: 0.82 },
  },
]

const P3_CODE_BLOCKS = [
  {
    language: "TypeScript",
    code: `// Unit Test - Arrange-Act-Assert Pattern
describe("OrderService.create", () => {
  it("should create order with correct total", async () => {
    // Arrange
    const items = [mockItem({ price: 29.99, qty: 2 })];
    const repo = mock<IOrderRepo>();
    repo.save.resolves({ id: "ord-1", total: 59.98 });

    // Act
    const order = await new OrderService(repo).create(items);

    // Assert
    expect(order.total).to.equal(59.98);
    expect(repo.save).calledOnce;
  });
});`,
  },
  {
    language: "YAML",
    code: `# GitHub Actions - CI Pipeline
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: test_db
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint
      - uses: codecov/codecov-action@v3`,
  },
  {
    language: "Python",
    code: `# Locust Load Test Configuration
class OrderAPIUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def create_order(self):
        self.client.post("/api/v1/orders",
            json={"items": [{"sku": "WIDGET-01", "qty": 2}]},
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(7)
    def list_orders(self):
        self.client.get("/api/v1/orders",
            headers={"Authorization": f"Bearer {self.token}"}
        )`,
  },
]

const P3_TABLES: { headers: string[]; rows: string[][]; caption?: string }[] = [
  {
    headers: ["Test Type", "Count", "Avg Time", "Coverage"],
    rows: [
      ["Unit Tests", "847", "12ms", "87%"],
      ["Integration", "213", "340ms", "72%"],
      ["E2E (Playwright)", "45", "4.2s", "100%*"],
      ["Contract (Pact)", "38", "890ms", "N/A"],
      ["Load (Locust)", "12", "5min", "N/A"],
    ],
    caption: "Table 5: Test Suite Summary (* E2E covers critical paths only)",
  },
  {
    headers: ["Metric", "Current", "Target", "Status"],
    rows: [
      ["Line Coverage", "87%", "85%", "PASS"],
      ["Branch Coverage", "79%", "80%", "NEAR"],
      ["Mutation Score", "87.3%", "85%", "PASS"],
      ["P95 Latency", "187ms", "200ms", "PASS"],
      ["Error Rate", "0.03%", "0.1%", "PASS"],
    ],
    caption: "Table 6: Quality Gate Metrics",
  },
]

const P3_BULLET_LISTS: string[][] = [
  [
    "All tests must pass before merge to main branch",
    "Code coverage must not decrease on any pull request",
    "Critical paths require both unit and integration test coverage",
    "Performance regression threshold set at 10% deviation from baseline",
    "Security scan must report zero critical vulnerabilities",
  ],
  [
    "Identify critical user journeys with product team",
    "Write acceptance criteria in Given-When-Then format",
    "Implement E2E tests using Page Object Model pattern",
    "Run smoke tests against staging after every deployment",
    "Archive test artifacts for 90-day audit retention",
  ],
]

const P3_BLOCK_QUOTES: { text: string; source?: string }[] = [
  {
    text: "Testing shows the presence, not the absence of bugs. A thorough test suite gives you confidence to deploy, but never certainty. That confidence must be earned through disciplined testing at every level.",
    source: "Edsger W. Dijkstra (adapted)",
  },
  {
    text: "If you don't have time to write tests, you don't have time to debug. The average defect takes 4-10x longer to fix in production than it would have taken to prevent with a test.",
    source: "Jeff Atwood, Coding Horror (2008)",
  },
]

// ── Page 4: Deployment & Maintenance (Q4) ────────────────────────────────────

const P4_PARAGRAPHS: { text: string; highlightable?: { criterionId: number; confidence: number } }[] = [
  {
    text: "Containerization with Docker ensures environment parity between development, staging, and production. Multi-stage builds reduce image size from 1.2GB to 180MB by separating the build environment from the runtime, minimizing the attack surface and deployment time.",
    highlightable: { criterionId: 4, confidence: 0.92 },
  },
  {
    text: "Kubernetes orchestration manages service deployment with horizontal pod autoscaling based on CPU and memory metrics. The cluster maintains a minimum of 3 replicas per service for high availability, with pod disruption budgets ensuring zero-downtime during rolling updates.",
    highlightable: { criterionId: 4, confidence: 0.87 },
  },
  {
    text: "Monitoring is implemented using Prometheus for metrics collection and Grafana for visualization. Dashboards track request latency, error rates, throughput, and resource utilization across all services, with PagerDuty integration for alerting on SLO violations.",
    highlightable: { criterionId: 3, confidence: 0.83 },
  },
  {
    text: "The deployment pipeline uses a canary strategy where new versions receive 5% of traffic initially, progressing to 25%, 50%, and 100% over 30 minutes. Automated rollback triggers if the error rate exceeds 0.1% above baseline at any stage.",
    highlightable: { criterionId: 2, confidence: 0.89 },
  },
  {
    text: "API versioning follows the URI path convention (/api/v1, /api/v2) with a deprecation period of 6 months per version. Sunset headers notify consumers of upcoming removals, and the developer portal maintains migration guides for each version transition.",
    highlightable: { criterionId: 3, confidence: 0.78 },
  },
  {
    text: "Structured logging using the JSON format enables centralized log aggregation through the ELK stack. Each log entry includes a correlation ID that traces the request path across service boundaries, enabling end-to-end request debugging without manual log correlation.",
    highlightable: { criterionId: 3, confidence: 0.86 },
  },
  {
    text: "After a production incident where a misconfigured health check caused a cascading restart, the team implemented chaos engineering practices. Weekly game days simulate network partitions, pod evictions, and dependency failures to verify system resilience.",
    highlightable: { criterionId: 2, confidence: 0.94 },
  },
  {
    text: "Infrastructure as code is managed through Terraform with state stored in an S3 backend. All infrastructure changes go through the same pull request review process as application code, ensuring auditability and peer review of capacity and security changes.",
    highlightable: { criterionId: 4, confidence: 0.81 },
  },
  {
    text: "Scalability testing revealed that the order service becomes CPU-bound at 2,000 requests per second. Horizontal scaling to 8 pods with connection pooling resolved the bottleneck, and the system now sustains 5,000 RPS with P99 latency under 500ms.",
    highlightable: { criterionId: 4, confidence: 0.73 },
  },
  {
    text: "The documentation is generated from source code using TypeDoc for the API reference and Docusaurus for the developer portal. Documentation is deployed automatically on every merge to main, ensuring the published docs always reflect the current API state.",
    highlightable: { criterionId: 3, confidence: 0.77 },
  },
  {
    text: "Blue-green deployments were evaluated but rejected in favor of canary releases due to the cost of maintaining duplicate production infrastructure. The canary approach provides the same safety guarantees with 50% lower infrastructure spend during deployments.",
    highlightable: { criterionId: 2, confidence: 0.85 },
  },
  {
    text: "Secret management uses HashiCorp Vault with dynamic database credentials that rotate every 24 hours. Applications request credentials at startup through the Vault agent sidecar, eliminating hardcoded secrets from configuration files and environment variables.",
    highlightable: { criterionId: 4, confidence: 0.91 },
  },
]

const P4_CODE_BLOCKS = [
  {
    language: "Dockerfile",
    code: `# Multi-stage Docker Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8080
USER node
CMD ["node", "dist/server.js"]`,
  },
  {
    language: "YAML",
    code: `# Kubernetes HPA Configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 12
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`,
  },
  {
    language: "HCL",
    code: `# Terraform - RDS Instance
resource "aws_db_instance" "orders" {
  identifier           = "orders-prod"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.r6g.large"
  allocated_storage    = 100
  storage_encrypted    = true
  multi_az             = true
  db_subnet_group_name = aws_db_subnet_group.main.name
  parameter_group_name = aws_db_parameter_group.orders.name
}`,
  },
]

const P4_TABLES: { headers: string[]; rows: string[][]; caption?: string }[] = [
  {
    headers: ["Stage", "Traffic", "Duration", "Rollback Trigger"],
    rows: [
      ["Canary 5%", "5%", "5 min", "Error rate > 0.1%"],
      ["Canary 25%", "25%", "10 min", "Error rate > 0.1%"],
      ["Canary 50%", "50%", "10 min", "P95 latency > 500ms"],
      ["Full Rollout", "100%", "—", "Manual verification"],
    ],
    caption: "Table 7: Canary Deployment Stages",
  },
  {
    headers: ["Resource", "Metric", "Threshold", "Action"],
    rows: [
      ["CPU", "Utilization", "> 70%", "Scale up +1 pod"],
      ["Memory", "Utilization", "> 80%", "Alert + investigate"],
      ["Error Rate", "5xx %", "> 0.1%", "Auto-rollback"],
      ["Latency P99", "ms", "> 500ms", "Alert + scale"],
      ["Disk I/O", "IOPS", "> 90%", "Alert"],
    ],
    caption: "Table 8: Monitoring Alert Configuration",
  },
]

const P4_BULLET_LISTS: string[][] = [
  [
    "Build Docker image using multi-stage compilation",
    "Push image to container registry with git SHA tag",
    "Deploy canary with 5% traffic allocation",
    "Monitor error rate and latency metrics for 5 minutes",
    "Progressively increase traffic through 25% → 50% → 100%",
    "Verify health checks pass on all new pods",
    "Mark deployment as complete in changelog",
  ],
  [
    "SLO: 99.9% availability measured over 30-day rolling window",
    "SLO: P95 latency under 200ms for all API endpoints",
    "SLO: Error rate below 0.1% for all service-to-service calls",
    "Error budget: 43.2 minutes of downtime per month",
    "Burn rate alerts at 6x and 14x consumption speed",
  ],
]

const P4_NUMBERED_LISTS: string[][] = [
  [
    "Engineer detects anomaly in Grafana dashboard",
    "PagerDuty alert triggers with runbook link",
    "On-call engineer acknowledges within 15 minutes",
    "Correlation ID extracted from logs for trace analysis",
    "Root cause identified through distributed tracing",
    "Fix deployed via hotfix pipeline (skip canary)",
    "Post-incident review scheduled within 48 hours",
    "Action items tracked in Jira with severity classification",
  ],
]

const P4_BLOCK_QUOTES: { text: string; source?: string }[] = [
  {
    text: "Hope is not a strategy. If you are not actively testing your system's resilience through chaos engineering, you are relying on your users to discover your failure modes for you.",
    source: "Nora Jones, Chaos Engineering (2020)",
  },
  {
    text: "The cost of a production incident is not measured in downtime alone. Each incident erodes trust, consumes engineering capacity, and delays feature delivery. Invest in prevention, not just response.",
    source: "Site Reliability Engineering, Google (2016)",
  },
]

// ── Synonym Jitter ────────────────────────────────────────────────────────────

const SYNONYM_SWAPS: [RegExp, ...string[]][] = [
  [/\bimplements?\b/, "implements", "realizes", "achieves", "fulfills"],
  [/\bdemonstrates?\b/, "demonstrates", "illustrates", "exhibits", "showcases"],
  [/\bensures?\b/, "ensures", "guarantees", "provides", "maintains"],
  [/\bsignificant\b/, "significant", "substantial", "considerable", "notable"],
  [/\bapproach\b/, "approach", "methodology", "strategy", "technique"],
  [/\badditionally\b/, "Additionally", "Furthermore", "Moreover", "In addition"],
  [/\bconsequently\b/, "Consequently", "As a result", "Therefore", "Hence"],
  [/\bcomprehensive\b/, "comprehensive", "thorough", "extensive", "complete"],
  [/\beffectively\b/, "effectively", "efficiently", "successfully", "adeptly"],
  [/\bfacilitates?\b/, "facilitates", "enables", "supports", "promotes"],
]

function applySynonymJitter(rng: () => number, text: string): string {
  let result = text
  for (const [pattern, ...alternatives] of SYNONYM_SWAPS) {
    if (pattern.test(result) && rng() < 0.4) {
      const replacement = pick(rng, alternatives)
      result = result.replace(pattern, replacement)
    }
  }
  return result
}

// ── Diagram Definitions ───────────────────────────────────────────────────────

const DIAGRAMS: { diagramType: "er" | "flowchart" | "architecture"; label: string }[] = [
  { diagramType: "er", label: "Entity-Relationship Diagram: Core Domain" },
  { diagramType: "flowchart", label: "Request Lifecycle: API Gateway to Database" },
  { diagramType: "architecture", label: "System Architecture: Service Topology" },
  { diagramType: "flowchart", label: "Deployment Pipeline: CI/CD Workflow" },
  { diagramType: "er", label: "Database Schema: Order Management" },
]

// ── Reference Sections ─────────────────────────────────────────────────────────

const REFERENCES = [
  "Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software. Addison-Wesley.",
  "Newman, S. (2021). Building Microservices: Designing Fine-Grained Systems. O'Reilly Media, 2nd Edition.",
  "Vernon, V. (2013). Implementing Domain-Driven Design. Addison-Wesley Professional.",
  "Fowler, M. (2002). Patterns of Enterprise Application Architecture. Addison-Wesley.",
  "Burns, B., Grant, B., Oppenheimer, D., et al. (2016). Borg, Omega, and Kubernetes. ACM Queue, 14(1).",
  "Kleppmann, M. (2017). Designing Data-Intensive Applications. O'Reilly Media.",
  "Nygard, M. (2018). Release It!: Design and Deploy Production-Ready Software. Pragmatic Bookshelf, 2nd Edition.",
  "Evans, E. (2003). Domain-Driven Design: Tackling Complexity in the Heart of Software. Addison-Wesley.",
  "Basiri, A., Behnam, N., de Rooij, R., et al. (2016). Chaos Engineering. IEEE Software, 33(3).",
  "Beyer, B., Jones, C., Petoff, J., & Murphy, N.R. (2016). Site Reliability Engineering. O'Reilly Media.",
]

// ── Page Builder ──────────────────────────────────────────────────────────────

interface PageContentPool {
  paragraphs: { text: string; highlightable?: { criterionId: number; confidence: number } }[]
  codeBlocks: { language: string; code: string }[]
  tables: { headers: string[]; rows: string[][]; caption?: string }[]
  bulletLists: string[][]
  numberedLists: string[][]
  blockQuotes: { text: string; source?: string }[]
}

const PAGE_POOLS: PageContentPool[] = [
  { paragraphs: P1_PARAGRAPHS, codeBlocks: P1_CODE_BLOCKS, tables: P1_TABLES, bulletLists: P1_BULLET_LISTS, numberedLists: P2_NUMBERED_LISTS, blockQuotes: P1_BLOCK_QUOTES },
  { paragraphs: P2_PARAGRAPHS, codeBlocks: P2_CODE_BLOCKS, tables: P2_TABLES, bulletLists: P2_BULLET_LISTS, numberedLists: P2_NUMBERED_LISTS, blockQuotes: P2_BLOCK_QUOTES },
  { paragraphs: P3_PARAGRAPHS, codeBlocks: P3_CODE_BLOCKS, tables: P3_TABLES, bulletLists: P3_BULLET_LISTS, numberedLists: P2_NUMBERED_LISTS, blockQuotes: P3_BLOCK_QUOTES },
  { paragraphs: P4_PARAGRAPHS, codeBlocks: P4_CODE_BLOCKS, tables: P4_TABLES, bulletLists: P4_BULLET_LISTS, numberedLists: P4_NUMBERED_LISTS, blockQuotes: P4_BLOCK_QUOTES },
]

function buildPage(rng: () => number, pool: PageContentPool, pageIndex: number): ManuscriptElement[] {
  const elements: ManuscriptElement[] = []

  const paragraphCount = randInt(rng, 3, 5)
  const selectedParagraphs = pickN(rng, pool.paragraphs, paragraphCount)

  const includeCode = rng() < 0.7
  const includeTable = rng() < 0.6
  const includeList = rng() < 0.5
  const includeBlockQuote = rng() < 0.3
  const includeDiagram = pageIndex > 0 && rng() < 0.25
  const includeReferences = pageIndex === 3 && rng() < 0.8

  const midElements: ManuscriptElement[] = []

  for (const p of selectedParagraphs) {
    const jitteredText = applySynonymJitter(rng, p.text)
    midElements.push({
      type: "paragraph",
      text: jitteredText,
      highlight: p.highlightable && rng() < 0.6 ? p.highlightable : undefined,
    })
  }

  if (includeCode) {
    midElements.push({ type: "code", ...pick(rng, pool.codeBlocks) })
  }
  if (includeTable) {
    midElements.push({ type: "table", ...pick(rng, pool.tables) })
  }
  if (includeList) {
    const listType = rng() < 0.5 ? "bulletList" : "numberedList"
    const lists = listType === "bulletList" ? pool.bulletLists : pool.numberedLists
    if (lists.length > 0) {
      midElements.push({ type: listType, items: pick(rng, lists) })
    }
  }
  if (includeBlockQuote && pool.blockQuotes.length > 0) {
    midElements.push({ type: "blockQuote", ...pick(rng, pool.blockQuotes) })
  }
  if (includeDiagram) {
    midElements.push({ type: "diagram", ...pick(rng, DIAGRAMS) })
  }

  // Shuffle mid-elements but keep first paragraph at top
  const firstParagraph = midElements.shift()!
  const shuffled: ManuscriptElement[] = [firstParagraph]
  const rest = midElements
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  shuffled.push(...rest)

  if (includeReferences) {
    const refCount = randInt(rng, 4, 7)
    const refs = pickN(rng, REFERENCES, refCount)
    shuffled.push({ type: "heading", text: "References", level: 3 })
    shuffled.push({ type: "numberedList", items: refs })
  }

  return shuffled
}

// ── Main Generator ────────────────────────────────────────────────────────────

export function generateManuscript(studentId: string): GeneratedManuscript {
  const rng = createRng(studentId)

  const adjective = pick(rng, TITLE_ADJECTIVES)
  const topic = pick(rng, TITLE_TOPICS)
  const approach = pick(rng, TITLE_APPROACHES)
  const title = `${adjective} ${topic}: ${approach}`

  const pages = PAGE_POOLS.map((pool, i) => ({
    elements: buildPage(rng, pool, i),
  }))

  return { title, pages }
}

// ── Artifact Generator ────────────────────────────────────────────────────────

const ARTIFACT_NAMES: Record<ArtifactType, string[]> = {
  pdf: [
    "Final_Submission.pdf",
    "Assignment_Report.pdf",
    "Technical_Documentation.pdf",
    "Project_Report.pdf",
    "SE_Assignment.pdf",
  ],
  docx: [
    "Written_Analysis.docx",
    "Design_Document.docx",
    "Requirements_Spec.docx",
    "Project_Report.docx",
  ],
  pptx: [
    "Presentation_Slides.pptx",
    "Architecture_Overview.pptx",
    "Sprint_Demo.pptx",
    "Design_Review.pptx",
  ],
  video: [
    "Demo Recording",
    "Code Walkthrough Video",
    "Presentation Recording",
    "Sprint Review Video",
  ],
  link: [
    "GitHub Repository",
    "Deployed Application",
    "API Documentation",
    "Figma Design File",
    "Jira Board",
  ],
  code: [
    "source_code.zip",
    "project_snapshot.zip",
    "codebase_v2.zip",
  ],
  image: [
    "Architecture_Diagram.png",
    "ER_Diagram.png",
    "Screenshot_Dashboard.png",
    "UML_Class_Diagram.png",
  ],
}

const ARTIFACT_SIZES: Record<ArtifactType, () => string> = {
  pdf: () => `${(Math.floor(Math.random() * 8) + 2)}.${Math.floor(Math.random() * 9)} MB`,
  docx: () => `${(Math.floor(Math.random() * 5) + 1)}.${Math.floor(Math.random() * 9)} MB`,
  pptx: () => `${(Math.floor(Math.random() * 12) + 3)}.${Math.floor(Math.random() * 9)} MB`,
  video: () => {
    const mins = Math.floor(Math.random() * 15) + 3
    const secs = Math.floor(Math.random() * 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  },
  link: () => "",
  code: () => `${(Math.floor(Math.random() * 15) + 2)}.${Math.floor(Math.random() * 9)} MB`,
  image: () => `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} MB`,
}

const SECONDARY_ARTIFACT_TYPES: ArtifactType[] = ["pptx", "video", "link", "code", "image"]

const PREVIEW_CONTENT: Record<ArtifactType, (name: string) => string> = {
  pdf: (name) => `This is a preview of "${name}". The document contains the student's full written submission with technical analysis, code examples, and architectural diagrams.`,
  docx: (name) => `This is a preview of "${name}". The document contains the student's written analysis with embedded diagrams and formatted tables.`,
  pptx: (name) => `This is a preview of "${name}". The presentation contains ${Math.floor(Math.random() * 10) + 8} slides covering the project overview, architecture, implementation, and results.`,
  video: (name) => `Video: "${name}" — ${Math.floor(Math.random() * 15) + 3} minute recording showing the project demonstration and code walkthrough.`,
  link: (name) => `External Link: "${name}" — Opens in a new tab to the student's submitted resource.`,
  code: (name) => `Archive: "${name}" — Contains the complete source code for the project with build instructions in the included README.md.`,
  image: (name) => `Image: "${name}" — A high-resolution diagram submitted as a supporting artifact.`,
}

export function generateArtifacts(studentId: string): StudentArtifact[] {
  const rng = createRng(studentId + "-artifacts")
  const artifacts: StudentArtifact[] = []

  const primaryType: ArtifactType = rng() < 0.7 ? "pdf" : "docx"
  artifacts.push({
    id: `${studentId}-primary`,
    name: pick(rng, ARTIFACT_NAMES[primaryType]),
    type: primaryType,
    size: ARTIFACT_SIZES[primaryType](),
    isPrimary: true,
    previewContent: PREVIEW_CONTENT[primaryType](pick(rng, ARTIFACT_NAMES[primaryType])),
  })

  const secondaryCount = randInt(rng, 0, 3)
  const usedTypes = new Set<ArtifactType>([primaryType])

  for (let i = 0; i < secondaryCount; i++) {
    let type: ArtifactType
    do {
      type = pick(rng, SECONDARY_ARTIFACT_TYPES)
    } while (usedTypes.has(type))
    usedTypes.add(type)

    const name = pick(rng, ARTIFACT_NAMES[type])
    artifacts.push({
      id: `${studentId}-sec-${i}`,
      name,
      type,
      size: ARTIFACT_SIZES[type](),
      isPrimary: false,
      previewContent: PREVIEW_CONTENT[type](name),
    })
  }

  return artifacts
}
