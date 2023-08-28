FROM node:16

WORKDIR /usr/src/client

COPY # Copy package.json and package-lock.json to the container
COPY ./package.json ./package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
