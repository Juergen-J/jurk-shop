# Medusa backend + admin, built from the monorepo root:
#   docker build -f apps/backend/Dockerfile .
FROM node:24-alpine AS build
RUN npm install -g pnpm@10.34.7
WORKDIR /app

# Workspace manifests first so the dependency layer is cached.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc turbo.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --frozen-lockfile --filter @dtc/backend...

COPY apps/backend apps/backend
RUN pnpm --filter @dtc/backend build

# The production build in .medusa/server is self-contained.
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/apps/backend/.medusa/server ./
RUN npm install --omit=dev --no-audit --no-fund

ENV NODE_ENV=production
ENV PORT=9000
EXPOSE 9000

# Migrations (idempotent) on every start, then the server.
CMD ["sh", "-c", "npm run predeploy && npm run start"]
