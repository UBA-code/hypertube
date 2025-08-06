FROM node:lts-alpine

WORKDIR /app

RUN apk update && apk add ffmpeg

RUN npm install -g @nestjs/cli

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]
