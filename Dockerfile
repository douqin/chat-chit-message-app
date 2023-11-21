FROM node:20

WORKDIR /user/src/app

COPY package*.json /user/src/app/

RUN npm install 

COPY . .

EXPOSE 8080

CMD [ "node", 'server.ts' ]