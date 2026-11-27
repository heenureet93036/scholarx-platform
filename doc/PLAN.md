# ScholarX — Implementation Plan

## Overview
ScholarX is an AI-powered scholar-to-full-time conversion tracker built as a microservices application.
Scholars upload their resume, select a target role, and get an AI-generated skill gap report with a personalised learning path.

---

## How to use this plan

After completing each task, go to `REPORT.md` and update the linked section before moving to the next task.
Each task below shows → **REPORT.md § section** so you know exactly where to go.

---

## Core Principle (4-line write-up for report)
- **Principle:** Event-Driven Architecture (Loose Coupling via Kafka)
- **Why it matters:** Resume parsing and gap analysis are compute-heavy; decoupling them means a slow AI step never blocks the scholar's experience
- **Where implemented:** Kafka events connect all 4 services — `resume.uploaded` → `skills.extracted` → `gap.report.ready`
- **How demonstrated:** Kill any downstream service; upstream continues working; events replay automatically on restart

> ✅ Done? → Update **REPORT.md § 2. Core Principle**

---

## Phase 1 — Foundation (All members)
- [ ] Create Spring Boot main application class per service
- [ ] Create Dockerfile per service (with justified base image — see Phase 3)
- [ ] Set up shared PostgreSQL schema
- [ ] Verify `docker compose up --build` runs all services

> ✅ Done? → Update **REPORT.md § 5. Docker → Docker Compose** (confirm one-command startup works)

---

## Phase 2 — Core Services

### scholar-service
- [ ] `Scholar` entity + PostgreSQL table
- [ ] `POST /api/scholars` — register scholar
- [ ] `POST /api/scholars/{id}/upload` — upload resume PDF
- [ ] `POST /api/scholars/{id}/target-role` — select target role
- [ ] Publish Kafka event `resume.uploaded` after successful upload
- [ ] gRPC server endpoint — expose `SkillExtractService` for sync skill extraction (used by gap-service for immediate queries)
- [ ] `GET /actuator/health/liveness` + `/actuator/health/readiness`

> ✅ Done? → Update **REPORT.md § 3. Architecture → Service Table** (fill scholar-service row with actual endpoints)

### ai-review-service
- [ ] Kafka consumer — listens to `resume.uploaded`
- [ ] Extract text from PDF using Apache PDFBox
- [ ] Send prompt to Ollama (Llama3) to extract skills as JSON
- [ ] Save extracted skills to PostgreSQL
- [ ] Publish Kafka event `skills.extracted`
- [ ] `GET /actuator/health`

> ✅ Done? → Update **REPORT.md § 3. Architecture → Service Table** (fill ai-review-service row) + **§ 4. ADR 2** (Ollama justification with actual model used)

### gap-service
- [ ] Kafka consumer — listens to `skills.extracted`
- [ ] gRPC client — calls scholar-service via gRPC to fetch scholar profile synchronously
- [ ] Load role requirements from DB (seed data per role)
- [ ] Compare scholar skills vs role requirements
- [ ] Compute readiness score (%)
- [ ] Save gap report to PostgreSQL
- [ ] Publish Kafka event `gap.report.ready`
- [ ] Resilience4j circuit breaker on gRPC call to scholar-service (threshold=3, timeout=30s, reset=30s)
- [ ] `GET /actuator/health`

> ✅ Done? → Update **REPORT.md § 3. Architecture → Communication Table** (gRPC row) + **§ 7. Failure Demo (a)** (circuit breaker config)

### notification-service
- [ ] Kafka consumer — listens to `gap.report.ready`
- [ ] Send email to scholar with gap report + learning path (SMTP)
- [ ] Send manager alert email
- [ ] Save notification log to PostgreSQL
- [ ] `GET /actuator/health`

> ✅ Done? → Update **REPORT.md § 3. Architecture → Service Table** (fill notification-service row)

---

## Phase 3 — Docker

### Dockerfiles (one per service)
- [ ] `scholar-service/Dockerfile` — justify base image (e.g. `eclipse-temurin:21-jre-alpine` — small, production-safe JRE)
- [ ] `ai-review-service/Dockerfile` — justify base image
- [ ] `gap-service/Dockerfile` — justify base image
- [ ] `notification-service/Dockerfile` — justify base image

> ✅ Done? → Update **REPORT.md § 5. Docker → Dockerfiles** (paste base image justification for each service)

### Docker Hub
- [ ] Create Docker Hub repo `scholarx/scholar-service`
- [ ] Push all images with version tag `1.0.0`
  - `scholarx/scholar-service:1.0.0`
  - `scholarx/ai-review-service:1.0.0`
  - `scholarx/gap-service:1.0.0`
  - `scholarx/notification-service:1.0.0`
- [ ] Use same tags in Kubernetes manifests (no `latest`)

> ✅ Done? → Update **REPORT.md § 5. Docker → Docker Hub Registry** (add actual Docker Hub URLs)

### Docker Compose
- [ ] `docker compose up --build` starts everything: services, PostgreSQL, Kafka, Zookeeper, Ollama
- [ ] Health-based start order (postgres → kafka → services)
- [ ] Named volumes: `postgres-data`, `ollama-data`
- [ ] Shared bridge network: `scholarx-network`
- [ ] `.env.example` file with all required env vars

> ✅ Done? → Update **REPORT.md § 5. Docker → Docker Compose** (confirm features, paste snippet if needed)

### Before vs After Docker (document in report with actual data)
- [ ] List manual steps without Docker:
  1. Install Java 21
  2. Install Maven
  3. Install PostgreSQL + create DB + create user
  4. Install Zookeeper
  5. Install Kafka + configure broker
  6. Install Ollama
  7. Pull Llama3 model (4GB download)
  8. Set environment variables manually
  9. Start Zookeeper
  10. Start Kafka
  11. Start PostgreSQL
  12. Start Ollama
  13. Build scholar-service (`mvn package`)
  14. Run scholar-service JAR
  15. Build ai-review-service (`mvn package`)
  16. Run ai-review-service JAR
  17. Build gap-service (`mvn package`)
  18. Run gap-service JAR
  19. Build notification-service (`mvn package`)
  20. Run notification-service JAR
  21. Configure NGINX manually
  22. Verify all services healthy
  - **Estimated time: ~45 minutes**
- [ ] Measure actual Docker startup time: `time docker compose up --build`
  - **Target: ~3 minutes**

> ✅ Done? → Update **REPORT.md § 5. Docker → Before vs After Docker** (fill in measured Docker time)

---

## Phase 4 — Kubernetes

### Manifests
- [ ] `Deployment` + `Service` manifest per microservice
- [ ] `scholar-service` — **2 replicas** (for self-healing demo)
- [ ] `ConfigMap` — Kafka broker URL, Ollama endpoint, DB host
- [ ] `Secret` — DB password, SMTP credentials
- [ ] Liveness probe: `/actuator/health/liveness`
- [ ] Readiness probe: `/actuator/health/readiness`
- [ ] Resource requests + limits per pod
- [ ] `PersistentVolumeClaim` for PostgreSQL
- [ ] Explicit image tags from Docker Hub: `scholarx/scholar-service:1.0.0`

> ✅ Done? → Update **REPORT.md § 6. Kubernetes Deployment** (fill key configuration table, add kubectl screenshot)

### Architectural Components
- [ ] **API Gateway** — NGINX Ingress: single entry point routing all traffic to services
- [ ] **Service Registry** — Kubernetes DNS: services discover each other by name, not hardcoded IP
- [ ] **Message Queue** — Apache Kafka: `resume.uploaded`, `skills.extracted`, `gap.report.ready` events
- [ ] **Circuit Breaker** — Resilience4j on gap-service gRPC call

> ✅ Done? → Update **REPORT.md § 3. Architecture → Architectural Components** (confirm all 4 are working)

---

## Phase 5 — Failure Demos

### (a) Circuit Breaker
- [ ] Configure Resilience4j on gap-service (failure_threshold=3, timeout=30s, reset_time=30s)
- [ ] Show system healthy
- [ ] Kill scholar-service → gRPC calls from gap-service fail → breaker opens → fallback activates
- [ ] Restart scholar-service → breaker closes after 30s reset → auto-recovery
- [ ] Screenshot evidence (command visible)

> ✅ Done? → Update **REPORT.md § 7. Failure Demo (a)** (insert screenshots for each step)

### (b) Kubernetes Self-Healing
- [ ] Run `kubectl get pods -w`
- [ ] Delete `scholar-service` pod: `kubectl delete pod <name>`
- [ ] Show replacement pod starting automatically (~15s)
- [ ] Screenshot evidence (command visible)
- [ ] Include this 4-line explanation in report:
  > "When a pod is deleted, the Deployment's ReplicaSet detects that the actual replica count (1) is less than the desired count (2). It immediately schedules a new pod on an available node. The readiness probe ensures traffic is only routed to the new pod after it passes health checks. This happens automatically with zero manual intervention — demonstrating Kubernetes self-healing."

> ✅ Done? → Update **REPORT.md § 7. Failure Demo (b)** (insert kubectl get pods -w screenshot)

---

## Phase 6 — Report & Demo

- [ ] Architecture diagram (draw.io or similar)
- [ ] Core principle 4-line write-up (see top of this file)
- [ ] Project report (10–12 pages):
  - Domain & objectives → **REPORT.md § 1**
  - Core principle → **REPORT.md § 2**
  - Architecture diagram + service table + communication table → **REPORT.md § 3**
  - **3 Architecture Decision Records (ADRs):** → **REPORT.md § 4**
    - ADR 1: Kafka for async inter-service communication
    - ADR 2: Ollama/Llama3 for local AI (no API key, no cost, works offline)
    - ADR 3: PostgreSQL for all services (single DB type, simpler setup)
  - Docker section → **REPORT.md § 5**
  - Kubernetes section → **REPORT.md § 6**
  - Failure demo evidence → **REPORT.md § 7**
  - Conclusion → **REPORT.md § 8**
- [ ] README with exact run steps
- [ ] Live demo: upload resume → skills extracted → gap report → email sent

> ✅ Done? → Final check — read through REPORT.md top to bottom and ensure no `[Insert screenshot]` placeholders remain

---

## Communication Summary

| From → To | Style | Sync/Async | Why | Failure Behaviour |
|---|---|---|---|---|
| Client → scholar-service | REST | Sync | Standard HTTP file upload | 4xx/5xx to client |
| gap-service → scholar-service | gRPC | Sync | Fetch scholar profile immediately during gap computation | Circuit breaker trips → fallback |
| scholar-service → ai-review-service | Kafka | Async | Resume processing in background | Event replayed on restart |
| ai-review-service → gap-service | Kafka | Async | Gap analysis runs independently | Event replayed on restart |
| gap-service → notification-service | Kafka | Async | Email fires independently | Retried via Kafka offset replay |

---

## Kafka Topics

| Topic | Producer | Consumer |
|---|---|---|
| `resume.uploaded` | scholar-service | ai-review-service |
| `skills.extracted` | ai-review-service | gap-service |
| `gap.report.ready` | gap-service | notification-service |

---

## Service Ports

| Service | Port |
|---|---|
| scholar-service | 8081 |
| ai-review-service | 8082 |
| gap-service | 8083 |
| notification-service | 8084 |
| PostgreSQL | 5432 |
| Kafka | 9092 |
| Ollama | 11434 |

---

## Deadline
**5 December 2026** — no extensions.

