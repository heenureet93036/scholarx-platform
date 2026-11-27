# ScholarX — Implementation Plan

## Overview
ScholarX is an AI-powered scholar-to-full-time conversion tracker built as a microservices application.
Scholars upload their resume, select a target role, and get an AI-generated skill gap report with a personalised learning path.

---

## Phase 1 — Foundation (All members)
- [ ] Create Spring Boot main application class per service
- [ ] Create Dockerfile per service
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
- [ ] `GET /actuator/health` liveness + readiness probes

### ai-review-service
- [ ] Kafka consumer — listens to `resume.uploaded`
- [ ] Extract text from PDF using Apache PDFBox
- [ ] Send prompt to Ollama (Llama3) to extract skills as JSON
- [ ] Save extracted skills to PostgreSQL
- [ ] Publish Kafka event `skills.extracted`
- [ ] `GET /actuator/health`

### gap-service
- [ ] Kafka consumer — listens to `skills.extracted`
- [ ] Load role requirements from DB (seed data per role)
- [ ] Compare scholar skills vs role requirements
- [ ] Compute readiness score (%)
- [ ] Save gap report to PostgreSQL
- [ ] Publish Kafka event `gap.report.ready`
- [ ] Resilience4j circuit breaker on any sync call
- [ ] `GET /actuator/health`

### notification-service
- [ ] Kafka consumer — listens to `gap.report.ready`
- [ ] Send email to scholar with gap report + learning path (SMTP)
- [ ] Send manager alert email
- [ ] Save notification log to PostgreSQL
- [ ] `GET /actuator/health`

---

## Phase 3 — Kubernetes

- [ ] `Deployment` + `Service` manifest per microservice
- [ ] `scholar-service` — 2 replicas (for self-healing demo)
- [ ] `ConfigMap` — Kafka broker URL, Ollama endpoint, DB host
- [ ] `Secret` — DB password, SMTP credentials
- [ ] Liveness probe: `/actuator/health/liveness`
- [ ] Readiness probe: `/actuator/health/readiness`
- [ ] Resource requests + limits per pod
- [ ] `PersistentVolumeClaim` for PostgreSQL
- [ ] Explicit image tags: `scholarx/scholar-service:1.0.0`

---

## Phase 4 — Failure Demos

### (a) Circuit Breaker
- [ ] Configure Resilience4j on gap-service (failure_threshold=3, timeout=30s)
- [ ] Kill a dependent service → show breaker opening + fallback response
- [ ] Restart service → show auto-recovery
- [ ] Screenshot evidence

### (b) Kubernetes Self-Healing
- [ ] Run `kubectl get pods -w`
- [ ] Delete `scholar-service` pod
- [ ] Show replacement pod starting automatically (~15s)
- [ ] Screenshot evidence

---

## Phase 5 — Report & Demo

- [ ] Architecture diagram (draw.io or similar)
- [ ] Project report (10–12 pages)
  - Domain & objectives
  - Core principle (Event-Driven)
  - Architecture diagram + service table + communication table
  - 3+ Architecture Decision Records (ADRs)
  - Docker section (Dockerfiles, Compose, before/after table)
  - Kubernetes section
  - Failure demo evidence
  - Conclusion
- [ ] README with exact run steps
- [ ] Live demo: upload resume → skills extracted → gap report → email sent

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
