FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json .

RUN npm i

FROM node:24-alpine AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV ORIGIN=http://localhost:3000
ENV ORIGIN=https://pickems.nmckee.org

RUN node --env-file=pickems.env build

FROM node:24-alpine AS run

CMD ["node", "build"]