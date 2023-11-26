FROM node:20-alpine

WORKDIR /user/src/app

COPY package*.json /user/src/app/

RUN npm install 

COPY ./dist/ .

COPY .env .

COPY chat-chit-vn-firebase-adminsdk-s5ov2-a6005a3a63.json .

EXPOSE 3000

CMD ["node", "server.js"]
