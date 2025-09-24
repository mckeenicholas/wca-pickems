FROM oven/bun:latest AS deps

WORKDIR /app

COPY package*.json .

RUN bun i --frozen-lockfile

FROM oven/bun:latest AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .


RUN bun run build

FROM oven/bun:latest AS run

WORKDIR /app

COPY --from=build /app/build build/
COPY .env .

ENV ORIGIN=http://localhost:3000
# ENV ORIGIN=https://pickems.nmckee.org

EXPOSE 3000

CMD ["bun", "run", "--env-file=.env", "build"]