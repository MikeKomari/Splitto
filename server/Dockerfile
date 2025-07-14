FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm i

COPY . .

RUN npx prisma generate --schema=./src/models/main.prisma

EXPOSE 8000

CMD ["npm", "start"]
