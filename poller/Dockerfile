FROM node:16-alpine

WORKDIR /app

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package*.json ./

RUN npm install

COPY . .

#CMD [ "/bin/sh", "./start.sh" ]
CMD [ "npm", "start" ]