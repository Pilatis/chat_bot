FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install
# Prisma 7 exige prisma.config.ts; no Docker usamos Prisma 6 para o schema atual (url no datasource)
RUN npm install prisma@6 @prisma/client@6 --save-dev --save

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Aplica migrations (ou db push se não houver migrations) antes de subir o servidor
CMD ["sh", "-c", "npx prisma migrate deploy || npx prisma db push --accept-data-loss; exec node dist/server.js"]
