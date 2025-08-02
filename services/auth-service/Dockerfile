# FROM node:18-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .

# # Build TypeScript
# RUN npm run build

# CMD ["npm", "start"]



# --- Stage 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:18 AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

CMD ["npm", "start"]
