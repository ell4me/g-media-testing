FROM node:24.10.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . ./

CMD ["npm", "run", "dev"]
