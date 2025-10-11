# Development target
FROM node:22-alpine AS dev
WORKDIR /app
# Use npm ci when lockfile exists, fallback to npm install
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
# command is set in docker compose

# Production build target
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY . .
RUN npm run build
