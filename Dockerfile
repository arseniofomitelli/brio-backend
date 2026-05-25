FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -S brio && adduser -S brio -G brio

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads/menu uploads/gallery && chown -R brio:brio uploads

USER brio

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/app.js"]
