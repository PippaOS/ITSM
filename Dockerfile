FROM node:alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Note: .env.local is mounted as a volume in docker-compose.yml
# Vite will read it from the mounted filesystem

CMD ["npm", "run", "dev"] 