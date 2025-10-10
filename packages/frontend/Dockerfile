FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

# Add non-root user
RUN addgroup -S app && adduser -S app -G app

# Install serve to serve static files
RUN npm install -g serve

WORKDIR /app

# Copy built files from builder
COPY --chown=app:app --from=builder /app/build ./build

# Switch to non-root user
USER app

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]
