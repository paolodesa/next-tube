# Specify the base image
FROM pds412/ffmpeg-qsv

# Install curl
RUN apt update && apt install -y curl

# Install nodejs and npm
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash
RUN apt install -y nodejs

# Clean up the package cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Copy the tsconifg.json file
COPY tsconfig.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
RUN mkdir src
COPY ./src ./src

# Build the TypeScript code
RUN npm run build

# Set the command to start the BullMQ worker
CMD ["npm", "run", "start"]