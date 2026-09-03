FROM node:20-slim AS base
WORKDIR /app

# Install dependencies using package.json only
COPY package.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Start production server
CMD ["npm", "start"]
