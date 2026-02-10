# 1. Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npx prisma generate
RUN npm run build

# 2. Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/api/app.js"]