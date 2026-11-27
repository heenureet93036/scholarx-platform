# Scalable Services — Assignment 2 Summary

## Application Name
**ScholarX** — AI-Powered Scholar-to-Full-Time Conversion Tracker

## Team
**Team Name:** NextGen

| Name | ID |
|---|---|
| HeenuReet | 2025SL93036 HS |
| HS Prajwal Bhardwaj | 2025SL93074 |
| Mehwish Sultana | I578361 |

**Mentor:** Prof. Sheetal R (sheetalr@wilp.bits-pilani.ac.in)

---

## Key Details

| Item | Info |
|---|---|
| Institute | BITS Pilani WILP |
| Deadline | **5 December 2026** (strict, no extensions) |
| Team Size | 1–4 members |
| Total Marks | 15 |
| Submission | Report + live demo (no PPT) |
| Demo format | Local demo is acceptable |
| Demo slots | Weekday evenings, 7:00–9:00 PM (tentative) |

> Early demo possible — email ma'am before 5 Dec if ready.

---

## Domain Constraint

> **Avoid generic topics** (e-commerce, hospital, bookshop) — marks will be deducted.
> Choose a unique topic.


---

## List of Services

| # | Service | Responsibility | Data Store |
|---|---|---|---|
| 1 | **scholar-service** | Scholar profile, resume upload (PDF), target role selection, conversion deadline tracking | PostgreSQL |
| 2 | **ai-review-service** | LLM reads resume → extracts and analyses skills from rotations, BITS projects, hackathons, certifications, open source | PostgreSQL |
| 3 | **gap-service** | Compares extracted skills vs role requirements, computes readiness score and gap report | PostgreSQL |
| 4 | **notification-service** | Emails gap report + learning path to scholar; alerts manager when scholar is conversion-ready | PostgreSQL |

---

## Part 1 — Microservices Application (What to build)

### Services (fill in after domain is chosen)

| Service | Responsibility (one sentence) | Tech stack | Own data store | Key endpoints |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

**Requirements:**
- Pick **one core microservices principle** and demonstrate it throughout
- Each service: single responsibility, own data store, documented API, `/health` endpoint

### Communication — include all three styles

| From → To | REST / gRPC / Queue | Sync or Async | Why | Behaviour on failure |
|---|---|---|---|---|
| | | | | |

> **Instructor tip (WhatsApp):** Include **all three** — REST, gRPC, and Message Queue.
> - REST: standard client-facing calls
> - gRPC: sync service-to-service (needs immediate answer)
> - Message Queue: async (work can happen later, services stay independent)

> **CR Saptarshi (WhatsApp):**
> "In the main assignment the communication part covers REST/ gRPC and message queues. Services must communicate with each other — justify your choice of synchronous (REST / gRPC) or asynchronous (message queue) communication for each interaction. I suggest including all forms of communication in your assignment"

### Architectural Components (at least 2)

| Component | Example tools | What to show |
|---|---|---|
| API Gateway | NGINX, Ingress | Single entry point routing to services |
| Service Registry | Eureka, Kubernetes DNS | Services found by name, not IP |
| Message Queue | RabbitMQ, Kafka | A producer and consumer working |
| Circuit Breaker | Resilience4j | Threshold, timeout, fallback configured |

### Kubernetes Deployment Requirements

- Deployment + Service manifest per microservice
- **At least 2 replicas** for the service used in the self-healing demo
- ConfigMap for settings, Secret for credentials
- Liveness and readiness probes + resource requests/limits
- Persistent volumes for databases
- Explicit image version tags (no `latest`)

---

## Part 2 — Docker

### Dockerfiles
- One per service
- Justify base image choice in 2–3 lines (e.g., `python:3.12-slim` vs `alpine`)

### Docker Compose
- `docker compose up --build` must start everything: services, DBs, broker, gateway
- Health-based start order, shared network, named volumes, `.env.example` file

### Registry
- Push all images to Docker Hub with version tags: `yourname/service-name:1.0.0`
- Use same tags in Kubernetes manifests

### Before vs After Docker

| Aspect | Without Docker | With Docker |
|---|---|---|
| Setup | Install runtimes, DBs, broker manually on each machine | Environment packaged in image |
| Dependencies | Version conflicts between services | Each service isolated |
| Start order | Start each process manually in order | Compose handles it with health checks |
| Consistency | "Works on my machine" | Same image in Compose and Kubernetes |
| Steps & time | List manual steps + estimated minutes | One command; measured time |

---

## Failure Demonstrations

### (a) Circuit Breaker
1. Show system healthy
2. Stop a dependent service
3. Send requests until breaker opens → fallback response returned
4. Restart service → show recovery

Document: failure threshold, timeout, reset time.

### (b) Kubernetes Self-Healing
1. Run `kubectl get pods -w`
2. Delete a pod: `kubectl delete pod <name>`
3. Show replacement pod starting automatically
4. Explain (3–4 lines) how the Deployment's ReplicaSet restores desired replica count

> Evidence required: screenshots with the command visible.

---

## Deliverables

| Deliverable | Contents |
|---|---|
| Report (10–12 pages) | Domain & objectives; core principle; architecture diagram, service table, communication table; 3+ architecture decisions; Docker section; Kubernetes section; failure demos with evidence; conclusion |
| Source code & artifacts | Service code, Dockerfiles, Compose file, K8s manifests, README with exact run steps |
| Failure demo evidence | Screenshots or recording for (a) circuit breaker and (b) self-healing |
| Presentation | 10–12 min: architecture, principle, live/recorded demo, then Q&A |

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
