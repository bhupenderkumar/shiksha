# Shiksha API

Java Spring Boot backend for the Shiksha School Management System.

## Tech Stack

- **Java 17** + **Spring Boot 3.2.3**
- **Spring Data JPA** + PostgreSQL (schema: `school`)
- **Spring Security** + JWT authentication
- **MinIO** for S3-compatible file storage
- **Redis** for caching
- **WebSocket** (STOMP + SockJS) for real-time notifications
- **Flyway** for database migrations
- **SpringDoc OpenAPI** for Swagger documentation

## Quick Start

### Prerequisites
- Java 17+
- Docker & Docker Compose

### Run with Docker Compose

```bash
cp .env.example .env
# Edit .env with your configuration
docker compose up -d
```

The API will be available at `http://localhost:3001/api/v1`

### Run Locally (Development)

```bash
# Start dependencies
docker compose up -d postgres redis minio

# Run the application
./mvnw spring-boot:run
```

## API Documentation

Swagger UI: `http://localhost:3001/api/v1/swagger-ui.html`

OpenAPI docs: `http://localhost:3001/api/v1/api-docs`

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /auth/login` | Login |
| Auth | `POST /auth/register` | Register |
| Auth | `POST /auth/refresh` | Refresh token |
| Auth | `GET /auth/profile` | Get profile |
| Students | `GET /students?classId=` | List by class |
| Students | `POST /students` | Create student |
| Students | `GET /students/{id}` | Get student |
| Students | `PUT /students/{id}` | Update student |
| Homework | `GET /homework/class/{classId}` | List by class |
| Homework | `POST /homework` | Create |
| Homework | `POST /homework/{id}/submissions` | Submit |
| Classwork | `GET /classwork/class/{classId}` | List by class |
| Classwork | `POST /classwork` | Create |
| Attendance | `POST /attendance/mark` | Bulk mark |
| Attendance | `GET /attendance/class/{classId}` | By class+date |
| Fees | `GET /fees/student/{studentId}` | Student fees |
| Fees | `POST /fees/{feeId}/payments` | Record payment |
| Classes | `GET /classes?schoolId=` | List classes |
| Subjects | `GET /classes/{classId}/subjects` | List subjects |
| ID Cards | `GET /id-cards/class/{classId}` | By class |
| Admissions | `GET /admissions?schoolId=` | List enquiries |
| Feedback | `GET /feedback` | List all |
| Feedback | `POST /feedback/parent-forms` | Create form |
| Sports | `POST /sports` | Enroll |
| Notifications | `GET /notifications?studentId=` | List |
| Settings | `GET /settings/{schoolId}` | Get settings |
| Dashboard | `GET /dashboard/stats?schoolId=` | Stats |
| Files | `POST /files/upload` | Upload file |
| Health | `GET /health` | Health check |

## Project Structure

```
src/main/java/com/shiksha/api/
├── ShikshaApiApplication.java
├── common/          # API response wrappers, exceptions
├── config/          # Spring configuration
├── controller/      # REST controllers
├── dto/             # Data transfer objects
├── entity/          # JPA entities
├── enums/           # Enumerations
├── repository/      # Spring Data JPA repositories
├── security/        # JWT auth, filters
└── service/         # Business logic
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/shiksha` | DB connection |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `JWT_SECRET` | (built-in) | JWT signing key |
| `MINIO_ENDPOINT` | `http://localhost:9000` | MinIO URL |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO user |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO password |
| `REDIS_HOST` | `localhost` | Redis host |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed origins |
