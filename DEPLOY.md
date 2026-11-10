# Preview host

Replace the tree already at `/opt/ditto-mvp` on the CentOS 7 host. Do not commit or paste secrets. The API keeps using the `.env` already on that machine. SMS stays stub.

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

`docker-compose.centos7.yml` runs Postgres with `seccomp:unconfined`. Set `OTP_PREVIEW_ANY_CODE=false` in the host env only when a real inbox code should be required.
