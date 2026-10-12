# Next.js storefront, built from the monorepo root:
#   docker build -f apps/storefront/Dockerfile .
FROM node:24-alpine AS build
RUN npm install -g pnpm@10.34.7
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter @dtc/storefront...

COPY apps/storefront apps/storefront

# NEXT_PUBLIC_* values are inlined at build time.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION=de
ARG NEXT_PUBLIC_FILE_HOSTNAME=
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_PUBLIC_FILE_HOSTNAME=$NEXT_PUBLIC_FILE_HOSTNAME \
    NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter @dtc/storefront build

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000
CMD ["pnpm", "--filter", "@dtc/storefront", "start"]
