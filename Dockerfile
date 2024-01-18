FROM node:20.11-alpine AS base
RUN npm i -g pnpm && mkdir /app

FROM base as builder
RUN mkdir -p /app/build
WORKDIR /app/build
COPY . /app/build 
RUN pnpm install --frozen-lockfile
RUN pnpm run build && rm -rf src


FROM base as container 
WORKDIR /app
COPY --from=builder /app/build .
EXPOSE 3000
CMD [ "pnpm", "run", "start:prod" ]
