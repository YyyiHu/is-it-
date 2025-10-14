# Development target
FROM node:22-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Default command is set in docker-compose
CMD ["npm", "run", "dev", "--", "--host"]