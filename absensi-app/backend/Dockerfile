FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads/absensi/kamera

EXPOSE 5000

CMD ["npm", "run", "dev"]
