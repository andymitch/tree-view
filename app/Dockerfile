FROM node:18-alpine

WORKDIR /app

# Copy package files for the Express app
COPY package*.json ./

# Install Express app dependencies
RUN npm install

# Copy the React app
COPY client/ ./client/

# Install React app dependencies and build
WORKDIR /app/client
RUN npm install && npm run build

# Switch back to the root directory
WORKDIR /app

# Copy the rest of the Express app
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
