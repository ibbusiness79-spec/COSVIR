FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=base /app/package.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src
COPY --from=base /app/tsconfig.json ./
EXPOSE 4000
CMD ["node", "dist/server.js"]
