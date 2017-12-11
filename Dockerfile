# stigbd/heroes-service

FROM node

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Expose API port to the outside
EXPOSE 3002

# Launch application
CMD ["npm","start"]
