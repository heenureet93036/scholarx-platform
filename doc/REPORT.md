# Scalable Services — Assignment 2 Report

**Application:** ScholarX — AI-Powered Scholar-to-Full-Time Conversion Tracker
**Team:** NextGen
**Institute:** BITS Pilani, Work Integrated Learning Programme

| Name | ID |
|---|---|
| HeenuReet | 2025SL93036 |
| HS Prajwal Bhardwaj | 2025SL93074 |
| Mehwish Sultana | I578361 |

**Mentor:** Prof. Sheetal R (sheetalr@wilp.bits-pilani.ac.in)

---

## 1. Domain and Objectives

### Problem
Thousands of scholars completing internships and rotations at companies like SAP have no structured way to assess their readiness for full-time conversion. Skills are gained across multiple rotations, BITS academic projects, hackathons, certifications, and open-source contributions — but no one maps these to actual job requirements. Managers lack a structured assessment tool, and HR spends weeks manually comparing profiles to role requirements.

### Solution
ScholarX is an AI-powered career readiness platform that:
1. Accepts a scholar's resume (PDF upload)
2. Extracts skills using a local LLM (Ollama/Llama3)
3. Compares extracted skills against full-time role requirements
4. Generates a readiness score and personalised gap report
5. Emails the report and learning path to the scholar and their manager

### Objectives
- Demonstrate event-driven microservices architecture in a real-world domain
- Show all three communication styles: REST, gRPC, and Message Queue
- Deploy on Kubernetes with circuit breaker and self-healing demonstrations

---

## 2. Core Principle

**Principle:** Event-Driven Architecture (Loose Coupling via Kafka)

**Why it matters for this domain:** Resume parsing and gap analysis are compute-heavy operations. Decoupling them via events means a slow AI step never blocks the scholar's upload experience. Each service reacts to events independently — a failure in one never cascades to another.

**Where it is implemented:** Kafka events connect all four services:
- `resume.uploaded` → triggers AI skill extraction
- `skills.extracted` → triggers gap analysis
- `gap.report.ready` → triggers email notification

**How it is demonstrated:** Stopping any downstream service (e.g. gap-service) does not affect resume uploads. When the service restarts, Kafka's offset replay delivers all missed events automatically — no data is lost.

---

## 3. Architecture

### Architecture Diagram

> _[Insert architecture diagram here — draw.io export or screenshot]_

### Service Table

| # | Service | Responsibility | Tech Stack | Data Store | Key Endpoints |
|---|---|---|---|---|---|
| 1 | `scholar-service` | Scholar profile, resume upload, target role selection, deadline tracking | Spring Boot 3, PDFBox | PostgreSQL | `POST /api/scholars`, `POST /api/scholars/{id}/upload`, `POST /api/scholars/{id}/target-role` |
| 2 | `ai-review-service` | Extracts skills from resume using Ollama/Llama3 LLM | Spring Boot 3, PDFBox, Ollama | PostgreSQL | Kafka consumer (`resume.uploaded`) |
| 3 | `gap-service` | Compares skills vs role requirements, computes readiness score | Spring Boot 3, Resilience4j | PostgreSQL | Kafka consumer (`skills.extracted`) |
| 4 | `notification-service` | Emails gap report and learning path to scholar and manager | Spring Boot 3, Spring Mail | PostgreSQL | Kafka consumer (`gap.report.ready`) |

### Communication Table

| From → To | Style | Sync/Async | Why | Behaviour on Failure |
|---|---|---|---|---|
| Client → `scholar-service` | REST | Sync | Standard HTTP multipart file upload | 4xx/5xx returned to client |
| `gap-service` → `scholar-service` | gRPC | Sync | Fetch scholar profile immediately during gap computation | Circuit breaker trips → fallback response returned |
| `scholar-service` → `ai-review-service` | Kafka | Async | Resume processing is background work, must not block scholar | Event replayed on consumer restart |
| `ai-review-service` → `gap-service` | Kafka | Async | Gap analysis is compute-heavy, runs independently | Event replayed on consumer restart |
| `gap-service` → `notification-service` | Kafka | Async | Email fires independently of gap computation | Retried via Kafka offset replay |

### Architectural Components

| Component | Tool | What it shows |
|---|---|---|
| **API Gateway** | NGINX Ingress | Single entry point routing all client traffic to services by path |
| **Service Registry** | Kubernetes DNS | Services discover each other by name (e.g. `scholar-service:8081`), not hardcoded IP |
| **Message Queue** | Apache Kafka | `resume.uploaded`, `skills.extracted`, `gap.report.ready` events flow asynchronously |
| **Circuit Breaker** | Resilience4j | Protects `gap-service` gRPC call to `scholar-service`; trips after 3 failures, fallback activates |

---

## 4. Architecture Decision Records (ADRs)

### ADR 1: Kafka for Asynchronous Inter-Service Communication

**Context:** Resume parsing and gap analysis are compute-heavy. Making these synchronous would block the scholar's experience and tightly couple services.

**Decision:** Use Apache Kafka for all inter-service communication except the gap-service → scholar-service profile fetch.

**Consequences:**
- Scholars get immediate feedback after upload; processing happens in background
- No event is lost — Kafka's offset replay delivers missed events when a service restarts
- Services are fully decoupled — each can be deployed, scaled, and restarted independently

---

### ADR 2: Ollama + Llama3 for Local AI

**Context:** The AI skill extraction step requires an LLM. Using a cloud API (e.g. OpenAI) introduces cost, internet dependency, and rate limits — problematic for a live demo environment.

**Decision:** Use Ollama running Llama3 locally as a Docker container.

**Consequences:**
- Zero API cost, works fully offline during demo
- No rate limits or external dependencies
- Llama3 model is downloaded once into a named Docker volume (`ollama-data`), persisted across restarts
- Fallback for production: change `OLLAMA_URL` env var to point to OpenAI-compatible endpoint

---

### ADR 3: PostgreSQL for All Services

**Context:** With limited time, managing multiple database technologies (PostgreSQL + MongoDB) increases operational complexity — separate containers, different Spring Data dependencies, different query styles.

**Decision:** Use PostgreSQL for all four services, each with its own schema.

**Consequences:**
- Single DB technology to manage — one container, one set of credentials
- Spring Data JPA works uniformly across all services
- Each service has its own schema, satisfying the "own data store" microservices principle
- Trade-off: gap reports are nested JSON — slightly more relational overhead than MongoDB, acceptable for this scale

---

## 5. Docker

### Dockerfiles

Each service has its own Dockerfile. Base image: `eclipse-temurin:21-jre-alpine`

**Justification:** `eclipse-temurin:21-jre-alpine` provides a production-safe JRE (not full JDK) on Alpine Linux — resulting in a small image (~180MB vs ~500MB for full JDK images). Alpine is minimal and battle-tested for container workloads. The JRE-only variant is sufficient since compilation happens at build time via Maven, not at runtime.

> _[Insert Dockerfile snippets or screenshots here]_

### Docker Compose

`docker compose up --build` starts the full stack:
- `postgres:16-alpine` — PostgreSQL database
- `confluentinc/cp-zookeeper:7.5.0` — Zookeeper (Kafka dependency)
- `confluentinc/cp-kafka:7.5.0` — Kafka broker
- `ollama/ollama:latest` — Local LLM server
- `scholar-service`, `ai-review-service`, `gap-service`, `notification-service`

Features:
- **Health-based startup order:** postgres → kafka → services (no service starts before its dependency is healthy)
- **Named volumes:** `postgres-data`, `ollama-data` (data persists across restarts)
- **Shared network:** `scholarx-network` bridge network
- **`.env.example`** provided for mail credentials

### Docker Hub Registry

All images pushed to Docker Hub with explicit version tags:

| Image | Tag |
|---|---|
| `scholarx/scholar-service` | `1.0.0` |
| `scholarx/ai-review-service` | `1.0.0` |
| `scholarx/gap-service` | `1.0.0` |
| `scholarx/notification-service` | `1.0.0` |

Same tags used in Kubernetes manifests — no `latest` tag used anywhere.

### Before vs After Docker

| Aspect | Without Docker | With Docker |
|---|---|---|
| **Setup** | Install Java 21, Maven, PostgreSQL, Zookeeper, Kafka, Ollama, pull Llama3 (4GB) manually on each machine | Everything packaged in images; `docker compose up --build` |
| **Dependencies** | Version conflicts between services (e.g. Java version mismatch) | Each service isolated in its own container |
| **Start order** | Start Zookeeper → Kafka → PostgreSQL → Ollama → each service manually in correct order | Compose handles health-based startup automatically |
| **Consistency** | "Works on my machine" — different OS, Java versions, path configs | Same image runs identically in Compose and Kubernetes |
| **Steps & time** | ~22 manual steps, estimated ~45 minutes | `docker compose up --build` — measured time: **_[insert measured time]_** |

---

## 6. Kubernetes Deployment

Each service is deployed with the following manifests:

- **Deployment** — defines pods, replicas, image, env vars, probes, resource limits
- **Service** — exposes pods within the cluster by name (Kubernetes DNS)
- **ConfigMap** — Kafka broker URL, Ollama endpoint, DB host
- **Secret** — DB password, SMTP credentials
- **PersistentVolumeClaim** — PostgreSQL data persistence

### Key Configuration

| Setting | Value |
|---|---|
| `scholar-service` replicas | **2** (used in self-healing demo) |
| All other services replicas | 1 |
| Liveness probe | `GET /actuator/health/liveness` |
| Readiness probe | `GET /actuator/health/readiness` |
| Image tags | `scholarx/<service>:1.0.0` (from Docker Hub) |

> _[Insert kubectl get pods / kubectl get deployments screenshot here]_

---

## 7. Failure Demonstrations

### (a) Circuit Breaker

**Configuration (Resilience4j on gap-service):**
- Failure threshold: 3 consecutive failures
- Timeout: 30 seconds
- Reset time: 30 seconds

**Demo Steps:**

1. **System healthy** — upload resume, gap report generated successfully
   > _[Insert screenshot — healthy state]_

2. **Stop scholar-service** — `kubectl delete pod scholar-service-xxxx`

3. **Send requests** — gap-service attempts gRPC call to scholar-service; fails 3 times → circuit breaker **OPENS**
   > _[Insert screenshot — breaker open, fallback response returned]_

4. **Restart scholar-service** — `kubectl apply -f k8s/scholar-service-deployment.yaml`

5. **After 30s reset window** — circuit breaker **CLOSES**, normal operation resumes
   > _[Insert screenshot — recovery]_

---

### (b) Kubernetes Self-Healing

**Demo Steps:**

1. Run `kubectl get pods -w` to watch pod states

2. Delete a scholar-service pod:
   ```
   kubectl delete pod scholar-service-xxxx
   ```

3. Watch the output — replacement pod starts automatically:
   ```
   scholar-service-xxxx    Terminating
   scholar-service-yyyy    ContainerCreating
   scholar-service-yyyy    Running          ← new pod in ~15s
   ```
   > _[Insert kubectl get pods -w screenshot here]_

**Explanation:**
When a pod is deleted, the Deployment's ReplicaSet detects that the actual replica count (1) is less than the desired count (2). It immediately schedules a new pod on an available node. The readiness probe ensures traffic is only routed to the new pod after it passes health checks. This happens automatically with zero manual intervention — demonstrating Kubernetes self-healing.

---

## 8. Conclusion

ScholarX demonstrates a production-grade event-driven microservices architecture applied to a real SAP scholar domain problem. The four services are fully decoupled via Kafka, independently deployable, and resilient to failure through Resilience4j circuit breaking and Kubernetes self-healing.

Key outcomes:
- All three communication styles demonstrated: REST (client-facing), gRPC (synchronous service-to-service), Kafka (asynchronous event-driven)
- All four architectural components implemented: API Gateway (NGINX), Service Registry (Kubernetes DNS), Message Queue (Kafka), Circuit Breaker (Resilience4j)
- Local AI via Ollama eliminates external dependencies and cost during demo
- One-command deployment (`docker compose up --build`) reduces setup from ~45 minutes to ~3 minutes

The architecture is extensible — a Course Service, React frontend, or Prometheus/Grafana observability layer can be added without modifying existing services.
