# ScholarX — Implementation Plan

## Overview
ScholarX is an AI-powered scholar-to-full-time conversion tracker built as a microservices application.
Scholars upload their resume, select a target role, and get an AI-generated skill gap report with a personalised learning path.

---

## Core Principle (4-line write-up for report)
- **Principle:** Event-Driven Architecture (Loose Coupling via Kafka)
- **Why it matters:** Resume parsing and gap analysis are compute-heavy; decoupling them means a slow AI step never blocks the scholar's experience
- **Where implemented:** Kafka events connect all 4 services — `resume.uploaded` → `skills.extracted` → `gap.report.ready`
- **How demonstrated:** Kill any downstream service; upstream continues working; events replay automatically on restart

---

## Phase 1 — Foundation (All members)
- [ ] Create Spring Boot main application class per service
- [ ] Create Dockerfile per service (with justified base image — see Phase 3)
- [ ] Set up shared PostgreSQL schema
- [ ] Verify `docker compose up --build` runs all services

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

### ai-review-service
- [ ] Kafka consumer — listens to `resume.uploaded`
- [ ] Extract text from PDF using Apache PDFBox
- [ ] Send prompt to Ollama (Llama3) to extract skills as JSON
- [ ] Save extracted skills to PostgreSQL
- [ ] Publish Kafka event `skills.extracted`
- [ ] `GET /actuator/health`

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

### notification-service
- [ ] Kafka consumer — listens to `gap.report.ready`
- [ ] Send email to scholar with gap report + learning path (SMTP)
- [ ] Send manager alert email
- [ ] Save notification log to PostgreSQL
- [ ] `GET /actuator/health`

---

## Phase 3 — Docker

### Dockerfiles (one per service)
- [ ] `scholar-service/Dockerfile` — justify base image (e.g. `eclipse-temurin:21-jre-alpine` — small, production-safe JRE)
- [ ] `ai-review-service/Dockerfile` — justify base image
- [ ] `gap-service/Dockerfile` — justify base image
- [ ] `notification-service/Dockerfile` — justify base image

### Docker Hub
- [ ] Create Docker Hub repo `scholarx/scholar-service`
- [ ] Push all images with version tag `1.0.0`
  - `scholarx/scholar-service:1.0.0`
  - `scholarx/ai-review-service:1.0.0`
  - `scholarx/gap-service:1.0.0`
  - `scholarx/notification-service:1.0.0`
- [ ] Use same tags in Kubernetes manifests (no `latest`)

### Before vs After Docker (document in report)
- [ ] List manual steps without Docker + estimated time (~25 steps, ~45 min)
- [ ] Show one-command Docker startup + measured time (~3 min)

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

### Architectural Components
- [ ] **API Gateway** — NGINX Ingress: single entry point routing all traffic to services
- [ ] **Service Registry** — Kubernetes DNS: services discover each other by name, not hardcoded IP
- [ ] **Message Queue** — Apache Kafka: `resume.uploaded`, `skills.extracted`, `gap.report.ready` events
- [ ] **Circuit Breaker** — Resilience4j on gap-service gRPC call

---

## Phase 5 — Failure Demos

### (a) Circuit Breaker
- [ ] Configure Resilience4j on gap-service (failure_threshold=3, timeout=30s, reset_time=30s)
- [ ] Show system healthy
- [ ] Kill scholar-service → gRPC calls from gap-service fail → breaker opens → fallback activates
- [ ] Restart scholar-service → breaker closes after 30s reset → auto-recovery
- [ ] Screenshot evidence (command visible)

### (b) Kubernetes Self-Healing
- [ ] Run `kubectl get pods -w`
- [ ] Delete `scholar-service` pod: `kubectl delete pod <name>`
- [ ] Show replacement pod starting automatically (~15s)
- [ ] Screenshot evidence (command visible)

---

## Phase 6 — Report & Demo

- [ ] Architecture diagram (draw.io or similar)
- [ ] Core principle 4-line write-up (see top of this file)
- [ ] Project report (10–12 pages):
  - Domain & objectives
  - Core principle
  - Architecture diagram + service table + communication table
  - **3 Architecture Decision Records (ADRs):**
    - ADR 1: Kafka for async inter-service communication
    - ADR 2: Ollama/Llama3 for local AI (no API key, no cost, works offline)
    - ADR 3: PostgreSQL for all services (single DB type, simpler setup)
  - Docker section: Dockerfiles + Compose + registry + before/after table
  - Kubernetes section
  - Failure demo evidence
  - Conclusion
- [ ] README with exact run steps
- [ ] Live demo: upload resume → skills extracted → gap report → email sent

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

