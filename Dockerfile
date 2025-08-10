FROM node:22-alpine AS builder

LABEL org.opencontainers.image.title="DAR-ACT-Cache"
LABEL org.opencontainers.image.description="Darbot Action Runner Cache Server"
LABEL org.opencontainers.image.vendor="Darbot"
LABEL org.opencontainers.image.source="https://github.com/darbot/dar-act-cache"

WORKDIR /app

RUN npm install -g pnpm@latest-10

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store pnpm fetch --prod

COPY . .
RUN pnpm install --frozen-lockfile --prod --offline

ARG BUILD_HASH
ENV BUILD_HASH=${BUILD_HASH}
RUN pnpm run build

# --------------------------------------------

FROM node:22-alpine AS runner

ENV NITRO_CLUSTER_WORKERS=1
ENV SERVICE_NAME=dar-act-cache

WORKDIR /app

COPY --from=builder /app/.output ./

EXPOSE 3000

CMD ["node", "/app/server/index.mjs"]