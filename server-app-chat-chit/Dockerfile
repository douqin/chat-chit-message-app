FROM node:20-alpine 

# Create app directory
WORKDIR /usr/src/app

COPY .env .env

# Install app dependencies
COPY package*.json ./

# RUN npm ci --production
RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV production

# USER node

EXPOSE 8080
CMD [ "node", "dist/server.js" ]
