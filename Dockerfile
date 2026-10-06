FROM node:22-alpine

WORKDIR /app

# Install dependencies needed for build
COPY package*.json ./
RUN npm install

# Copy application files
COPY . ./

# Build Next.js application
RUN npm run build

# Volume mount point for SQLite database persistence
VOLUME ["/app/data"]

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
