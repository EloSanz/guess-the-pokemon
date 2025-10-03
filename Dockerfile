# Multi-stage build for both frontend and backend
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN pnpm --filter frontend build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy built frontend and backend
COPY --from=base /app/frontend/dist ./frontend/dist
COPY --from=base /app/backend ./backend
COPY --from=base /app/shared ./shared
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3001

CMD ["pnpm", "--filter backend", "start"]
