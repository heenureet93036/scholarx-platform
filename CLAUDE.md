# ScholarX — Claude Context

This file gives full project context for AI-assisted development.

---

## Application

**Name:** ScholarX — AI-Powered Scholar-to-Full-Time Conversion Tracker
**Tagline:** "Upload your resume. Pick your dream role. Know exactly what's missing. Get there."
**Repo:** https://github.com/heenureet93036/scholarx-platform

---

## Team

**Team Name:** NextGen

| Name | ID | Service |
|---|---|---|
| HeenuReet | 2025SL93036 | scholar-service, gap-service |
| Mehwish Sultana | I578361 | ai-review-service (Ollama/LLM) |
| HS Prajwal Bhardwaj | 2025SL93074 | notification-service |

**Mentor:** Prof. Sheetal R (sheetalr@wilp.bits-pilani.ac.in)
**Deadline:** 5 December 2026 (no extensions)
**Total Marks:** 15

---

## Problem Statement

Scholars completing internships/rotations at companies like SAP have no structured way to know if they're ready for full-time conversion. They gain skills across multiple rotations, BITS academic projects (FYP, semester projects, lab work), hackathons, bootcamps, certifications, and open-source — but no one maps these to actual job requirements.

ScholarX solves this:
1. Scholar uploads their resume (PDF)
2. Selects a target full-time role
3. AI extracts skills from resume
4. Generates a gap report with readiness score
5. Provides a personalised learning path to close gaps before conversion deadline

---

## Core Principle

**Event-Driven Architecture (Loose Coupling)**
Every resume upload, skill extraction, and gap detection triggers downstream services independently through Kafka events. No service waits for another.

---

## Services

| # | Service | Port | Responsibility | Data Store |
|---|---|---|---|---|
| 1 | `scholar-service` | 8081 | Scholar profile, resume upload (PDF), target role selection, conversion deadline tracking | PostgreSQL |
| 2 | `ai-review-service` | 8082 | LLM reads resume via Ollama/Llama3, extracts skills from rotations, BITS projects, hackathons, certifications | PostgreSQL |
| 3 | `gap-service` | 8083 | Compares extracted skills vs role requirements, computes readiness score and gap report | PostgreSQL |
| 4 | `notification-service` | 8084 | Emails gap report + learning path to scholar; alerts manager | PostgreSQL |

---

## Kafka Topics

| Topic | Producer | Consumer |
|---|---|---|
| `resume.uploaded` | scholar-service | ai-review-service |
| `skills.extracted` | ai-review-service | gap-service |
| `gap.report.ready` | gap-service | notification-service |

---

## Communication

| From → To | Style | Sync/Async | Why |
|---|---|---|---|
| Client → scholar-service | REST | Sync | Standard HTTP file upload |
| scholar-service → ai-review-service | Kafka | Async | Decoupled, resume processing in background |
| ai-review-service → gap-service | Kafka | Async | Gap analysis runs independently |
| gap-service → notification-service | Kafka | Async | Email fires independently |

---

## Architectural Components

| Component | Tool |
|---|---|
| API Gateway | NGINX Ingress |
| Service Registry | Kubernetes DNS |
| Message Queue | Apache Kafka |
| Circuit Breaker | Resilience4j (gap-service) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21 + Spring Boot 3.2 |
| AI / LLM | Ollama + Llama3 (local, free, no API key) |
| PDF Parsing | Apache PDFBox |
| Message Queue | Apache Kafka + Zookeeper |
| Circuit Breaker | Resilience4j |
| API Gateway | NGINX Ingress |
| Frontend | React (optional) |
| Database | PostgreSQL (all 4 services) |
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes (Minikube locally) |

---

## Project Structure

```
scholarx-platform/
├── scholar-service/
│   ├── pom.xml
│   └── src/main/resources/application.yml
├── ai-review-service/
│   ├── pom.xml          ← includes PDFBox + Kafka
│   └── src/main/resources/application.yml
├── gap-service/
│   ├── pom.xml          ← includes Resilience4j
│   └── src/main/resources/application.yml
├── notification-service/
│   ├── pom.xml          ← includes Spring Mail
│   └── src/main/resources/application.yml
├── docker-compose.yml   ← postgres, kafka, zookeeper, ollama + all 4 services
├── .env.example
├── PLAN.md
└── CLAUDE.md
```

---

## Infrastructure (docker-compose.yml)

- `postgres:16-alpine` — single shared PostgreSQL instance, DB name `scholardb`
- `confluentinc/cp-kafka:7.5.0` + `cp-zookeeper:7.5.0`
- `ollama/ollama:latest` — runs Llama3 locally, no API cost
- All services on `scholarx-network` bridge network
- Health-check ordered startup

---

## Failure Demos Required

### (a) Circuit Breaker
- Configured in `gap-service` via Resilience4j
- Kill a dependent service → breaker opens after 3 failures → fallback response
- Restart → auto-recovery after 30s reset window
- Settings: `failure_threshold=3, timeout=30s, reset_time=30s`

### (b) Kubernetes Self-Healing
- `scholar-service` runs with 2 replicas
- Delete pod → Kubernetes ReplicaSet restarts it in ~15s
- Evidence: `kubectl get pods -w` screenshot

---

## Marking Scheme

| Area | Marks |
|---|---|
| Design and services | 2 |
| Core principle | 1 |
| Communication | 1 |
| Architectural components | 1.5 |
| Dockerfiles | 1.5 |
| Compose, registry, before/after | 1.5 |
| Kubernetes manifests | 2 |
| Circuit breaker demo | 1.5 |
| Self-healing demo | 1 |
| Architecture decisions | 1 |
| Report and presentation | 1 |
| **Total** | **15** |

---

## Key Decisions

1. **PostgreSQL for all services** — single DB type, simpler setup, less config overhead given time constraints
2. **Ollama for local AI** — no API key, no cost, works offline during demo. Fallback: swap `OLLAMA_URL` env var to point to OpenAI
3. **Kafka async for all inter-service communication** — loose coupling, offset replay means no event lost on restart
4. **Resilience4j on gap-service** — most likely failure point (compute-heavy), circuit breaker prevents cascade
