FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches (patches must be present before pnpm install)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build frontend (explicitly from /app where vite.config.ts lives)
RUN pnpm vite build --config vite.config.ts

# Build backend
RUN pnpm esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
