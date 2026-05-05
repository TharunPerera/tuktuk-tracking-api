# Use Node.js LTS (Long Term Support) — stable, security-patched
FROM node:20-alpine

# Alpine Linux = tiny image (5MB vs 900MB for full Ubuntu)
# We need these for native modules like bcrypt
RUN apk add --no-cache python3 make g++

# Set working directory inside container
WORKDIR /app

# Copy package files FIRST
# Docker caches layers — if package.json hasn't changed,
# it won't re-run npm install on every build (faster)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Document that the container listens on port 3000
EXPOSE 3000

# Health check — Railway uses this to know if the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { if(r.statusCode===200) process.exit(0); else process.exit(1); })"

# Run as non-root user (security best practice)
USER node

# Start the server
CMD ["npm", "start"]