# ScholarX Platform
AI-powered scholar-to-full-time conversion tracker | Microservices with Spring Boot, Kafka, gRPC, Ollama, Kubernetes

---

## Team — NextGen

| Name | ID |
|---|---|
| HeenuReet | 2025SL93036 |
| HS Prajwal Bhardwaj | 2025SL93074 |
| Mehwish Sultana | I578361 |

**Mentor:** Prof. Sheetal R (sheetalr@wilp.bits-pilani.ac.in)

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
├── docker-compose.yml   ← full stack: postgres, kafka, zookeeper, ollama + all 4 services
└── .env.example
```

---

## Services & Ports

| Service | Port | Responsibility |
|---|---|---|
| `scholar-service` | 8081 | Scholar profile, resume upload, target role selection |
| `ai-review-service` | 8082 | LLM skill extraction from resume via Ollama |
| `gap-service` | 8083 | Readiness score and gap report computation |
| `notification-service` | 8084 | Email gap report and learning path to scholar |

---

## Run Locally

```bash
cp .env.example .env
# fill in MAIL_USER and MAIL_PASS in .env

docker compose up --build
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21 + Spring Boot 3 |
| AI / LLM | Ollama + Llama3 (local) |
| PDF Parsing | Apache PDFBox |
| Message Queue | Apache Kafka |
| Circuit Breaker | Resilience4j |
| Database | PostgreSQL |
| Containers | Docker + Docker Compose |
| Orchestration | Kubernetes (Minikube) |
