# Deploy

Two stacks can run on the same CentOS 7 Docker host. Do not commit secrets, and do not put a server IP in this repo. Passwords live only in env files on the machine.

## First preview

The H5 build can keep calling the NestJS API already on the host (`apps/api`, Postgres, port 3000). Java comes up beside it: MySQL, Flyway v1, and `GET /health`. Leave the preview H5 on Nest until the Java questionnaire and event endpoints exist. Do not stop Postgres or the Nest process to bring Java up.

Build the H5 with `VITE_API_BASE_URL` pointed at the Nest origin already in use (`apps/mini/.env.example` defaults to `http://localhost:3000`). A value saved in the app overrides that.

## NestJS + Postgres (preview API)

`docker-compose.centos7.yml` is still only Postgres, with `seccomp:unconfined`.

```bash
cd /opt/ditto-mvp
git pull
docker-compose -f docker-compose.centos7.yml up -d
cd apps/api
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm exec nest build
# restart the existing API process with the host's current .env
cd ../..
pnpm --filter @ditto/mini build:h5
# point the existing static server at apps/mini/dist/build/h5
```

Set `OTP_PREVIEW_ANY_CODE=false` in the host env only when a real inbox code should be required. SMS stays on the provider already configured there.

## Java + MySQL

Module: `apps/api-java`. Java 17, Spring Boot 4.1.1, `spring-boot-starter-web` (not WebFlux), Flyway, MyBatis-Plus, MySQL 8.

```bash
cd /opt/ditto-mvp
cp deploy/.env.example deploy/.env
# edit deploy/.env on the host. set MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD.

docker-compose --env-file deploy/.env -f docker-compose.java.centos7.yml up -d --build mysql api-java
curl -sS http://127.0.0.1:8080/health
```

Expect HTTP 200 and JSON `"status":"ok"`, `"schemaVersion":"1"`, `"schools":5`. Flyway creates the v1 tables and the five Fangshan schools. `match_cycle`, `match_result`, `blocklist`, and `meetup` are not created.

| Service | Default host port | Notes |
| --- | --- | --- |
| MySQL 8.0 | 3306 | New. Postgres stays on 5432. |
| Java API | 8080 | Health and migrations. Not the preview H5 backend yet. |
| H5 nginx | 8088 | Optional. The existing static server can keep serving the build. |

Override the host ports in `deploy/.env` when they are already taken.

### Optional static H5

Use this when Compose should serve the uni-app build. The first preview can skip it and keep the current static server.

```bash
pnpm install
pnpm build:mini:h5
docker-compose --env-file deploy/.env -f docker-compose.java.centos7.yml up -d h5
```

Nginx serves `apps/mini/dist/build/h5` and falls back to `index.html`, including `/m/<token>`.

The H5 still calls whatever `VITE_API_BASE_URL` was at build time. For the first preview that is the Nest origin, not port 8080.

### CentOS 7

- Use `docker-compose` and `docker-compose.java.centos7.yml`. That file sets `seccomp:unconfined` on MySQL, the Java image (Ubuntu 22.04 / Temurin 17), and nginx. The host libseccomp cannot run these images without it. Postgres already uses the same workaround.
- Compose v1 here has no profiles and no `depends_on.condition`. The API retries Flyway for about a minute while MySQL initializes. `restart: unless-stopped` starts it again if it loses that race.
- The host is cgroup v1. MySQL is pinned to `mysql:8.0`, not MySQL 9.
- MySQL starts with `utf8mb4` / `utf8mb4_0900_ai_ci`, `--default-time-zone=+08:00`, and a 256M InnoDB buffer pool. Leave about 1GB free. A smaller machine can be OOM-killed during first startup.
- The image also sets `--skip-log-bin` and `--log-bin-trust-function-creators=1`. MySQL 8 turns the binary log on by default, and without one of those the app user cannot create the append-only triggers on `tracking_event`.
- The JVM and MySQL use Asia/Shanghai. `DATETIME(3)` values are Shanghai wall time.
- If `docker-compose` rejects `--env-file`, load the file in the shell: `set -a; . ./deploy/.env; set +a`.
- `pnpm build:mini:h5` needs Node 20.19+ (this repo runs on Node 22). The CentOS 7 system Node is too old. Build on a newer machine and copy `apps/mini/dist/build/h5`, or run a `node:22` container with `seccomp:unconfined`.
- Nothing in git contains the host IP or a database password. `deploy/.env` stays on the machine.

## Laptop (Compose v2)

```bash
cp deploy/.env.example deploy/.env
# set the two passwords
docker compose --env-file deploy/.env -f docker-compose.java.yml up -d --build
curl -sS http://127.0.0.1:8080/health
```

Postgres for Nest is still `docker compose up -d` (`docker-compose.yml`). The Java file uses its own MySQL volume, so the two databases do not share data.
