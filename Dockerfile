# Stage 1: build frontend
FROM node:18-alpine as client-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build

# Stage 2: production image
FROM node:18-alpine
WORKDIR /app
# Copy only production dependencies
COPY package*.json ./
RUN npm install --production
# Copy build output and server code
COPY --from=client-builder /app/dist ./dist
COPY --from=client-builder /app/server ./server
# Expose application port
EXPOSE 4000
# Start the combined server and static frontend
CMD ["node", "server/index.js"] 