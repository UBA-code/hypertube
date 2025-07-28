FROM node:lts

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY package*.json ./

RUN npm i

COPY . .

CMD ["npm", "run", "start:dev"]
