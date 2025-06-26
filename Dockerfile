FROM node:22.12-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENTRYPOINT ["node", "dist/server.js", "run-server", "--stdio", "--barredAPIs", "GraphQL"]