FROM node:16-alpine AS client

WORKDIR /src

COPY ./client/package*.json ./

RUN npm install

COPY ./client .

RUN npm run build

FROM node:16-bullseye

WORKDIR /app

ENV TZ=Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY ./api/package*.json ./

RUN npm install

COPY ./api .

RUN npm run build

COPY --from=client /src/build/ /app/client/

CMD [ "node", "dist/main" ]