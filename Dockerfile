FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY build/ ./build/

RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcp -u 1001

RUN chown -R mcp:nodejs /app
USER mcp

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["node", "build/server.js"]
