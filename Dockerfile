FROM node:17-alpine

WORKDIR /app
COPY package*.json .
RUN npm i

COPY . .

ENTRYPOINT [ "npm", "start" ]