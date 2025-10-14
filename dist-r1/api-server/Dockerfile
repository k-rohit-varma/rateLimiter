FROM node:20-alpine
WORKDIR /distributed_services
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7070
CMD [ "node", "server.js" ]