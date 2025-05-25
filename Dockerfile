# Stage 1: build frontend
FROM node:18-alpine as client-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . ./
RUN npm run build

# Stage 2: production image
FROM node:18-alpine
WORKDIR /app
# Copy built frontend and server source
COPY --from=client-builder /app/dist ./dist
COPY --from=client-builder /app/server ./server

# Install server dependencies
WORKDIR /app/server
RUN npm install --production --ignore-scripts

WORKDIR /app
# Expose application port
EXPOSE 4000
# Start the combined server and static frontend
CMD ["node", "server/index.js"] 