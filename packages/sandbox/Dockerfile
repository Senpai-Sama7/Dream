FROM node:20-alpine

# Add non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create runtime directory with proper permissions
RUN mkdir -p /app/runtime && chown app:app /app/runtime

# Switch to non-root user
USER app

EXPOSE 8070

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8070/health || exit 1

CMD ["npm", "run", "start"]
