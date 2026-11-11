# apps/api-java

Java 17 API for 不如见一面. Spring Boot 4.1.1, `spring-boot-starter-web` (not WebFlux), MySQL 8, Flyway, MyBatis-Plus.

This slice boots, applies the v1 schema, and serves `GET /health`. It does not implement `POST /api/v1/events`, `PUT /api/v1/questionnaire/answers`, or `POST /api/v1/questionnaire/submit`. Question keys stay in `apps/api/src/questionnaire/catalog.ts` until that API is written. They are not copied into MySQL enum tables.

The H5 preview still calls the NestJS API. See [DEPLOY.md](../../DEPLOY.md).

## Run with Compose

```bash
cp deploy/.env.example deploy/.env
# set MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD in deploy/.env
docker compose --env-file deploy/.env -f docker-compose.java.yml up -d --build
curl -sS http://127.0.0.1:8080/health
```

A healthy body has `"status":"ok"`, `"schemaVersion":"1"`, and `"schools":5`.

## Run the jar on the host

Requires JDK 17 and a MySQL 8 database created with `utf8mb4` / `utf8mb4_0900_ai_ci` and `+08:00`.

```bash
cp apps/api-java/.env.example apps/api-java/.env
# set SPRING_DATASOURCE_PASSWORD
set -a
. ./apps/api-java/.env
set +a
mvn -f apps/api-java/pom.xml spring-boot:run
```

`mvn -f apps/api-java/pom.xml test` starts MySQL 8 with Testcontainers and checks Flyway plus `/health`. Docker has to be running.
