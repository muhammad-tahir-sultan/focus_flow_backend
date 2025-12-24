import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TechnicalRoadmap, TechnicalRoadmapDocument } from './schemas/technical-roadmap.schema';

@Injectable()
export class SeedingService implements OnModuleInit {
    constructor(@InjectModel(TechnicalRoadmap.name) private roadmapModel: Model<TechnicalRoadmapDocument>) { }

    async onModuleInit() {
        // Check for the core masterclass entry
        const masterclassTitle = 'Backend Performance Mastery: Database Optimization & Fast APIs';
        const exists = await this.roadmapModel.findOne({ title: masterclassTitle }).exec();

        if (!exists) {
            await this.seedMasterclass();
        }

        const count = await this.roadmapModel.countDocuments().exec();
        if (count <= 1) { // If only masterclass exists or nothing exists, seed the others
            await this.seedInitial();
        }
    }

    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async seedMasterclass() {
        const masterclass = {
            title: 'Backend Performance Mastery: Database Optimization & Fast APIs',
            summary: 'A masterclass in architecting high-scalability backends, mastering MongoDB internals, and eliminating API bottlenecks.',
            category: 'Backend',
            priority: 'High',
            status: 'Planned',
            difficulty: 5,
            whyThisMatters: 'In the senior engineering bracket, the ability to optimize for the "Last 10%" of performance is what defines architectural leadership and ensures product longevity.',
            motivation: 'To move beyond "getting it working" to "making it fly"—the ultimate differentiator for senior backend engineers.',
            problemsItSolves: [
                'Linear performance degradation during scaling',
                'Extreme infrastructure costs due to inefficient queries',
                'N+1 query bottlenecks in complex systems',
                'Slow API response times'
            ],
            tradeOffs: [
                'Increased code complexity for caching',
                'Maintenance overhead of complex indexes',
                'Development time for background worker implementation'
            ],
            learningOutcomes: [
                'Mastery of MongoDB explain stats',
                'Implementing O(1) cursor pagination',
                'Eliminating N+1 problems with DataLoaders',
                'Architecting multi-layer caching'
            ],
            content: `
# Backend Performance Mastery: Database Optimization & Fast APIs

## INTRODUCTION

Performance is not a "nice-to-have" feature; it is a **force multiplier** for any engineering organization. When your API response times drop from 500ms to 50ms, the entire user experience shifts from "functional" to "magical". For SaaS builders, performance translates directly into lower infrastructure costs, higher user retention, and the ability to scale without hitting architectural walls.

Most developers treat the database as a black box—a place where data goes in and comes out via magic. This roadmap is designed to shatter that box. We will dive into the deep mechanics of storage engines, index geometry, and query planners. Mastering these internals separates the senior engineer who can architect a system for 1M users from the junior dev who merely "gets it working" on localhost.

---

## PHASE 1: DATABASE FUNDAMENTALS

### MongoDB Internals: The B-Tree and Beyond

To optimize queries, you must understand how MongoDB finds data. At its heart, MongoDB (via the WiredTiger engine) uses **B-Tree indexes**.

*   **B-Tree Concept**: Think of a B-Tree as a balanced search tree where each node contains multiple keys. This allows the engine to jump through millions of records in a handful of disk operations. If your query isn't indexed, MongoDB must perform a **COLLSCAN** (Collection Scan), reading every single document into memory.
*   **Index Selectivity**: Not all indexes are equal. An index on a boolean field (e.g., \`isActive\`) has low selectivity and often hurts performance because the engine still has to fetch half the collection. High selectivity fields (e.g., \`email\`, \`userId\`) are the bread and butter of performance.
*   **Compound Indexes**: The order of fields matters (The ESR Rule: Equality, Sort, Range). An index on \`{ userId: 1, createdAt: -1 }\` is perfect for "get latest logs for user X", but \`{ createdAt: -1, userId: 1 }\` is much less efficient for the same query.
*   **Covered Queries**: The "Holy Grail" of performance. If your index contains all the fields requested in the projection, MongoDB never even touches the document data on disk. It returns everything from the index in RAM.
*   **The Cost of Indexes**: Every index is a trade-off. Each write (insert/update/delete) must now update the indexes. Too many indexes will slow down your ingestion rates and increase memory pressure.

#### Hands-on Practice Tasks
- **Creating indexes**: Experiment with compound indexes on \`userId + createdAt\`.
- **Selectivity Test**: Create an index on \`email\` and measure the speed difference.
- **Profiling**: Compare query performance with and without indexes using \`.explain("executionStats")\`.
- **Winning Plans**: Learn to identify why MongoDB chose one index over another.

#### Outcomes
- **Understanding Execution Plans**: You will be able to read an \`explain()\` output and pinpoint the exact stage where a query slows down.
- **Index Precision**: You will stop "spray-and-pray" indexing and start building surgically precise compound indexes.

---

## PHASE 2: DATA MODELING FOR PERFORMANCE

### Embedding vs. Referencing

In the world of NoSQL, "Normalization" is often the enemy of speed.

*   **Embedding (Denormalization)**: Storing related data within the same document. 
    *   **Pros**: Single read operation (Atomicity). No population needed.
    *   **When to use**: Read-heavy patterns, "belongs-to" relationships where data is small (e.g., User Preferences, Profile metadata).
*   **Referencing (Normalization)**: Storing an ID and "joining" (populating) at runtime.
    *   **Pros**: Smaller documents. Easy to update shared data.
    *   **When to use**: Write-heavy patterns, many-to-many relationships, or when the "many" side can grow boundlessly (e.g., User -> Logs).

#### Explicit Rules:
1.  **Read-heavy** -> Embed.
2.  **Write-heavy** -> Reference.
3.  **Avoid populate inside loops**: This creates the "N+1" problem at the database driver level.

#### Practice Section
- **Scenario**: Users -> Orders -> Products.
- **Experiment**: Build two models: One fully referenced and one where product names are semi-embedded in orders.
- **Comparison**: Compare response times for a "Recent Orders" page fetching 50 items.
- **Insight**: Observe how document size increases but latency drops significantly when embedding.

---

## PHASE 3: QUERY OPTIMIZATION

### Pagination Optimization

Using \`skip(10000).limit(10)\` is a time bomb. As the skip value grows, the database must still scan and discard those 10,000 documents. This is a linear performance degradation.

*   **Cursor-based Pagination**: Instead of skipping, we filter by the last value seen (e.g., \`_id\` or \`createdAt\`).
    *   Example: \`find({ createdAt: { $lt: lastSeenDate } }).sort({ createdAt: -1 }).limit(10)\`.
    *   This is an **O(1)** operation if indexed. It is consistent whether you are on page 1 or page 1,000.

---

### N+1 Query Problem (GraphQL)

GraphQL makes N+1 errors invisible. If you query 100 Logs and then the User for each Log, you've just triggered 101 database calls.

*   **How DataLoader Works**: 
    1. It collects (batches) all individual IDs requested during a single execution tick.
    2. It executes a single \`$in\` query to fetch all 100 users.
    3. It distributes the results back to the original callers.
*   **Result**: 101 queries become 2 queries.

#### Practice
- Measure DB calls for a nested list query before and after implementing a NestJS DataLoader.
- This is an **interview-defining topic**: Seniors solve N+1; juniors ship it to production.

---

## PHASE 4: NESTJS PERFORMANCE OPTIMIZATION

### Caching Strategy

A senior architect knows that the fastest request is the one that never hits the database.

*   **In-memory (per-request)**: Use for data that stays constant during a single execution (e.g., current user metadata).
*   **Redis (shared)**: Use for cross-request caching, session data, and computationally expensive analytics.
*   **Mindset**: Cache invalidation is one of the "two hard things" in computer science. Prefer **Time-To-Live (TTL)** based invalidation for simplicity.

### Lean Queries & Projection

NestJS and Mongoose create "Hydrated" documents by default. These are heavy objects with Change Tracking and internal methods.

\`\`\`typescript
// JUNIOR WAY (Slow, high memory)
const users = await this.userModel.find();

// SENIOR WAY (Fast, plain JS objects)
const users = await this.userModel.find().select('name email').lean();
\`\`\`
Using \`.lean()\` can reduce memory usage and CPU time by up to **70%** for read-only operations.

---

## PHASE 5: API-LEVEL SPEED BOOST

### GraphQL Optimization
*   **Over-fetching**: The primary sin. Only request the fields necessary for the view.
*   **Query Depth Limiting**: Prevent malicious "depth bombs" that can take down your server.
*   **Complexity Analysis**: Assign "costs" to fields and reject queries exceeding a threshold.
*   **Introspection**: Disable in production to reduce the attack surface.

### Async & Background Processing
If a task takes longer than 100ms (sending an email, processing a report), move it to a background worker.
*   **Event-driven mindset**: The API returns \`202 Accepted\`, and a worker (using **BullMQ**) handles the heavy lifting in the background.

---

## PHASE 6: PRODUCTION-LEVEL OPTIMIZATION

### Monitoring & Profiling
*   **MongoDB Profiler**: Set the threshold to 100ms. Analyze the logs weekly.
*   **OpenTelemetry**: Use distributed tracing to find the "long pole" in your request chain.
*   **APM**: Real-time visibility into your production performance bottlenecks.

### Load Handling
*   **Connection Pooling**: Managing how many simultaneous connections your NestJS app maintains with MongoDB.
*   **Rate Limiting**: Use \`@nestjs/throttler\` to protect your expensive endpoints from abuse.
*   **Horizontal Scaling**: Designing your app so that adding more instances actually increases throughput (avoiding local state).

---

## 4-WEEK EXECUTION PLAN

| Week | Focus | Daily Learning | Outcome |
| :--- | :--- | :--- | :--- |
| **Week 1** | **DB Internals** | B-Tree geometry, ESR Rule, Explain Stats. | Indexing Mastery. |
| **Week 2** | **Data Modeling** | Embed vs Ref, Schema Stress Testing. | Decision-making Clarity. |
| **Week 3** | **API Patterns** | Dataloaders, Cursor Pagination, Lean queries. | Zero N+1 issues. |
| **Week 4** | **Infrastructure** | Redis Caching, BullMQ, APM Monitoring. | Production Scaling. |

---

## FINAL REFLECTION

Mastering performance is the transition from being a "coder" to being an "architect". It requires patience and a willingness to look under the hood. When you understand how bits move across the wire and how data is indexed on disk, you gain the confidence to build systems that don't just work—they fly.

This knowledge is the foundation of building high-value SaaS products where infrastructure costs are low and user delight is high. It is the shortest path to technical authority and senior-level compensation. **The journey starts with a single \`.explain()\`.**
            `,
            resources: [
                { label: 'MongoDB Performance Workshop', url: 'https://university.mongodb.com/', type: 'Course' },
                { label: 'High Performance Browser Networking', url: 'https://hpbn.co/', type: 'Book' },
                { label: 'DataLoader Source & Patterns', url: 'https://github.com/graphql/dataloader', type: 'Docs' }
            ],
            slug: this.generateSlug('Backend Performance Mastery: Database Optimization & Fast APIs'),
            plannedStart: new Date(),
            plannedEnd: new Date(new Date().setMonth(new Date().getMonth() + 4)),
        };

        await new this.roadmapModel(masterclass).save();
        console.log('Seeded Masterclass: Backend Performance Mastery');
    }

    async seedInitial() {
        const entries = [
            {
                title: 'Database Optimization & Query Performance',
                summary: 'Mastering the art of high-performance data access patterns and internal engine tuning.',
                category: 'Backend',
                priority: 'High',
                status: 'Planned',
                difficulty: 4,
                whyThisMatters: 'As we scale Focus Flow, the database will become the primary bottleneck. Sub-second response times are non-negotiable for a premium experience.',
                motivation: 'To transition from an application developer who "uses" databases to an engineer who understands "engines".',
                problemsItSolves: ['Slow dashboard loading', 'High CPU usage during analytics generation', 'N+1 query issues in complex logs'],
                tradeOffs: ['Increased code complexity for caching', 'Higher memory overhead for optimized indexes', 'Stricter schema constraints'],
                learningOutcomes: ['Deep understanding of B-Tree vs LSM trees', 'Mastery of EXPLAIN ANALYZE', 'Implementing efficient partitioning'],
                content: `
# Database Optimization & Query Performance

High-performance applications are built on high-performance data patterns. This roadmap focuses on moving beyond basic CRUD operations into the realm of database internals and query optimization.

## The Objective
The goal is to ensure that Focus Flow can handle millions of execution logs without degrading performance. This requires a deep dive into how MongoDB (and SQL engines) actually work under the hood.

## Core Focus Areas

### 1. Internal Engine Mastery
Understanding the storage engine (WiredTiger for MongoDB). How data is physically paged into memory and written to disk.

### 2. Advanced Indexing
Moving beyond single-field indexes. We will master:
- **Compound Indexes**: ESR (Equal, Sort, Range) rule.
- **Partial Indexes**: Reducing index size by only indexing active data.
- **TTL Indexes**: Automated archival logic.

### 3. Query Analysis
Using the profile tools to identify "winning plans". We will learn to spot:
- **COLLSCAN**: The enemy of performance.
- **SORT**: In-memory sorts that should be indexed.
- **FETCH**: Reducing the number of document lookups.

### 4. Aggregation Pipelines
Optimizing the analytics engine. Using \`$facet\`, \`$lookup\`, and \`$bucket\` to generate complex reports in a single pass.

## Execution Plan
We will start by profiling the current \`daily-logs\` analytics and refactoring the aggregation pipelines to use indexed fields exclusively.
                `,
                resources: [
                    { label: 'Database Internals Book', url: 'https://www.databass.dev/', type: 'Book' },
                    { label: 'MongoDB Performance Course', url: 'https://university.mongodb.com/', type: 'Course' }
                ]
            },
            {
                title: 'Advanced GraphQL & Real-time Systems',
                summary: 'Transitioning from REST to a unified, scalable GraphQL layer with Subscriptions.',
                category: 'Backend',
                priority: 'Medium',
                status: 'Planned',
                difficulty: 3,
                whyThisMatters: 'Focus Flow needs real-time updates for streaks and goal progress across multiple devices.',
                motivation: 'Enabling a seamless multi-client architecture where the frontend only requests exactly what it needs.',
                problemsItSolves: ['Over-fetching on mobile views', 'Manual polling for analytics updates', 'Fragmented API documentation'],
                tradeOffs: ['Caching becomes significantly harder', 'Initial setup complexity', 'N+1 problems if not using DataLoaders'],
                learningOutcomes: ['Schema-first design patterns', 'Implementing DataLoaders for batching', 'Websocket-based subscriptions'],
                content: `
# Advanced GraphQL & Real-time Systems

Modern apps feel "alive" when they respond to changes instantly. GraphQL provides the flexibility, and Subscriptions provide the soul.

## Why GraphQL?
REST often leads to "under-fetching" (multiple round-trips) or "over-fetching" (huge payloads). GraphQL's declarative nature solves this for our growing dashboard.

## Real-time Requirements
When a user logs an entry on their phone, the desktop dashboard should update its streak counter and charts without a refresh.

## Key Pillars

### 1. The Gateway Layer
Building a resilient GraphQL server using Apollo or Mercurius. Defining a shared schema that spans our logs, goals, and roadmaps.

### 2. The DataLoader Pattern
Solving the N+1 problem. Ensuring that nested goals and user metadata are fetched in single, batched queries.

### 3. Subscriptions & WebSockets
Implementing a PubSub mechanism (likely Redis-backed) to push updates to the UI the moment a document changes in MongoDB.

### 4. Type Safety
End-to-end type safety from the NestJS schema to the React frontend using GraphQL Code Generator.
                `,
                resources: [
                    { label: 'Official Apollo Docs', url: 'https://www.apollographql.com/docs/', type: 'Docs' },
                    { label: 'Fullstack GraphQL Course', url: 'https://www.howtographql.com/', type: 'Course' }
                ]
            },
            {
                title: 'Backend System Design for Scalable SaaS',
                summary: 'Architecting for the next 100k users. Load balancing, multi-region, and high availability.',
                category: 'System Design',
                priority: 'High',
                status: 'Planned',
                difficulty: 5,
                whyThisMatters: 'To scale Focus Flow beyond a personal tool into a team discipline platform.',
                motivation: 'To master the architecture patterns used by companies like Stripe and Netflix.',
                problemsItSolves: ['Single point of failure risks', 'High latency for global users', 'Manual deployment bottlenecks'],
                tradeOffs: ['Significantly higher infrastructure costs', 'Operational complexity', 'Eventual consistency challenges'],
                learningOutcomes: ['Mastering Distributed ID generation', 'Load balancing algorithms', 'Database Sharding'],
                content: `
# Backend System Design for Scalable SaaS

Scaling from 1 to 100,000 users isn't just about buying a bigger server; it's about a complete rethink of how data flows and how components communicate.

## The Blueprint
Focus Flow must evolve into a distributed system. We are moving away from monolithic thinking toward a services-oriented architecture.

## Pillars of Scale

### 1. High Availability (HA)
Implementing redundancy at every layer. Multiple instances of the NestJS backend behind a Nginx or HAProxy load balancer.

### 2. Global Distribution
Using CDNs for the frontend and considering Multi-Region MongoDB clusters to bring data closer to international users.

### 3. Horizontal vs Vertical Scaling
Moving from upgrading the RAM (Vertical) to adding more nodes (Horizontal). This requires our application state to be completely external (Redis/DB).

### 4. Rate Limiting & Quotas
Protecting the system from abuse and ensuring fair usage via token-bucket algorithms.

## Long-term Vision
This roadmap culminates in a system that can sustain 99.9% uptime while undergoing heavy traffic and rolling updates.
                `,
                resources: [
                    { label: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/', type: 'Book' },
                    { label: 'ByteByteGo System Design', url: 'https://bytebytego.com/', type: 'Article' }
                ]
            },
            {
                title: 'Distributed Systems & Microservices Architecture',
                summary: 'Breaking the monolith. Event-driven communication and service discovery.',
                category: 'System Design',
                priority: 'Medium',
                status: 'Planned',
                difficulty: 4,
                whyThisMatters: 'Decoupling the logging system from the authentication and analytics modules.',
                motivation: 'Independent scaling of services and fault isolation.',
                problemsItSolves: ['Slow build times for the monolith', 'Circular dependency hell', 'Tightly coupled business logic'],
                tradeOffs: ['Network latency between services', 'Tracing and debugging become difficult', 'Complex DevOps orchestration'],
                learningOutcomes: ['Understanding gRPC vs REST', 'Implementing Saga patterns', 'Message queue mastery (RabbitMQ/Kafka)'],
                content: `
# Distributed Systems & Microservices

As Focus Flow grows, the "Blast Radius" of a single bug increases. Microservices allow us to isolate features and scale them independently.

## The Event-Driven Core
Moving from synchronous calls to asynchronous messaging. When a log is created, an 'ExecutionEvent' is published to a queue. The analytics and achievement services consume this at their own pace.

## Key Concepts

### 1. API Gateway
A single entry point for all clients, handling auth, routing, and rate limiting before hitting inner services.

### 2. Service Discovery
How services find each other in a dynamic environment without hardcoded IP addresses.

### 3. Observability
Implementing Distributed Tracing (OpenTelemetry/Jaeger) to see how a single request traverses five different services.

### 4. Circuit Breakers
Ensuring that a failure in the "Achievement Service" doesn't bring down the main "Daily Log" submission flow.
                `,
                resources: [
                    { label: 'Microservices.io', url: 'https://microservices.io/', type: 'Article' },
                    { label: 'Cloud Native Patterns', url: 'https://www.manning.com/books/cloud-native-patterns', type: 'Book' }
                ]
            },
            {
                title: 'DevOps & Infrastructure as Code',
                summary: 'Automating everything. Terraform, Kubernetes, and CI/CD excellence.',
                category: 'DevOps',
                priority: 'High',
                status: 'Planned',
                difficulty: 4,
                whyThisMatters: 'Manual deployments are prone to error and slow down the feedback loop.',
                motivation: 'Treating infrastructure just like application code—version controlled and testable.',
                problemsItSolves: ['"It works on my machine" issues', 'Manual server configuration drift', 'Slow rollback times'],
                tradeOffs: ['Steep learning curve for K8s', 'Initial setup time investment', 'Complex secret management'],
                learningOutcomes: ['Writing Terraform modules', 'Kubernetes cluster management', 'Advanced GitHub Actions'],
                content: `
# DevOps & Infrastructure as Code (IaC)

A senior architect must know how to deploy and manage the systems they design. DevOps is the bridge between code and production.

## The Goal
To achieve a "One-Click Production" setup where any change to the master branch is automatically tested, scanned for security, and deployed with zero downtime.

## Roadmap Phases

### 1. Terraform Mastery
Defining our entire AWS/DigitalOcean stack in code. VPCs, DB clusters, and Load Balancers versioned in Git.

### 2. Container Orchestration (Kubernetes)
Moving from standalone Docker containers to a managed K8s cluster (EKS/GKE). Learning about Pods, Deployments, and Ingress.

### 3. CI/CD Pipelines
Integrating unit, integration, and E2E tests into the deployment flow. Implementing "Blue-Green" or "Canary" deployments.

### 4. Secret Management
Moving away from \`.env\` files to HashiCorp Vault or AWS Secrets Manager.
                `,
                resources: [
                    { label: 'Terraform Up & Running', url: 'https://www.terraformupandrunning.com/', type: 'Book' },
                    { label: 'Kubernetes Official Training', url: 'https://kubernetes.io/docs/home/', type: 'Docs' }
                ]
            },
            {
                title: 'Security Engineering & Zero Trust Architecture',
                summary: 'Building a fortress. OAuth2, OIDC, and proactive threat modeling.',
                category: 'DevOps',
                priority: 'Medium',
                status: 'Planned',
                difficulty: 4,
                whyThisMatters: 'User trust is the foundation of Focus Flow. Data breaches are terminal for SaaS companies.',
                motivation: 'Implementing security by design, not as an afterthought.',
                problemsItSolves: ['Identity theft risks', 'XSS and CSRF attacks', 'Leaked API keys'],
                tradeOffs: ['Increased friction for internal dev access', 'Complex authentication logic', 'Regular maintenance for patches'],
                learningOutcomes: ['Mastering JWT security best practices', 'OWASP Top 10 mitigation', 'Implementing RBAC and ABAC'],
                content: `
# Security Engineering & Zero Trust

Security is not a checkbox; it's a process. In a Zero Trust architecture, we assume the network is compromised and verify every single request.

## The Strategy

### 1. Modern Identity
Moving beyond simple email/pass to MFA (Multi-Factor Authentication) and Biometric support (WebAuthn).

### 2. Proactive Auditing
Integrating dependency scanning (Snyk) and Static Analysis Security Testing (SAST) into our CI pipeline.

### 3. Data at Rest & In Transit
Ensuring everything is encrypted. Rotating encryption keys periodically.

### 4. Threat Modeling
Thinking like an attacker. Identifying "Attack Surfaces" and closing them before they are exploited.
                `,
                resources: [
                    { label: 'OWASP Guide', url: 'https://owasp.org/www-project-top-ten/', type: 'Docs' },
                    { label: 'Web Security Academy', url: 'https://portswigger.net/web-security', type: 'Course' }
                ]
            },
            {
                title: 'AI Integration & LLMs in Production',
                summary: 'Leveraging AI for personalized discipline coaching and analytics insights.',
                category: 'AI',
                priority: 'High',
                status: 'Planned',
                difficulty: 3,
                whyThisMatters: 'To make Focus Flow a "Proactive" coach rather than a passive logger.',
                motivation: 'Blending cutting-edge generative AI with traditional behavioral science.',
                problemsItSolves: ['User burnout detection', 'Generic goal suggestions', 'Complex data patterns invisible to humans'],
                tradeOffs: ['AI hallucinations', 'High API costs for tokens', 'Privacy concerns around data sharing with LLMs'],
                learningOutcomes: ['Prompt Engineering for SaaS', 'RAG (Retrieval Augmented Generation)', 'Vector Database management (Pinecone/Milvus)'],
                content: `
# AI Integration & LLMs in Production

The future of productivity apps is AI-driven. This roadmap explores how to integrate LLMs to provide real value without the gimmickry.

## Focus Flow AI Vision
The AI should analyze a user's logs and detect patterns of procrastination or burnout *before* the user realizes it. It should suggest roadmap adjustments based on historical performance.

## Technical Implementation

### 1. Semantic Search & RAG
Storing our technical roadmaps and user goals in a Vector Database. When a user asks "What should I learn next?", the AI combines the roadmap data with the user's current progress.

### 2. Function Calling
Training the model to interact with our API. "Log a 2-hour workout" should be parsed by the LLM and translated into a \`POST /daily-logs\` call.

### 3. Guardrails & Safety
Implementing frameworks like LangChain or Outlines to ensure the AI's output is predictable and safe.

### 4. Local Models
Exploring Llama 3 or Mistral running on the edge for maximum privacy and reduced latency.
                `,
                resources: [
                    { label: 'DeepLearning.AI Courses', url: 'https://www.deeplearning.ai/', type: 'Course' },
                    { label: 'Pinecone Learning Center', url: 'https://www.pinecone.io/learn/', type: 'Article' }
                ]
            }
        ];

        const titles = entries.map(e => e.title);
        const existingEntries = await this.roadmapModel.find({ title: { $in: titles } }).exec();
        const existingTitles = existingEntries.map(e => e.title);

        const newEntries = entries.filter(e => !existingTitles.includes(e.title));

        if (newEntries.length > 0) {
            const seedData = newEntries.map(entry => ({
                ...entry,
                slug: this.generateSlug(entry.title),
                plannedStart: new Date(),
                plannedEnd: new Date(new Date().setMonth(new Date().getMonth() + 6)),
            }));

            await this.roadmapModel.insertMany(seedData);
            console.log(`Seeded ${newEntries.length} additional Technical Roadmap entries`);
        }
    }
}
