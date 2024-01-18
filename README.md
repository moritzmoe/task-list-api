# Tasks API

## Description

A simple [NestJS](https://github.com/nestjs/nest)-based API for managing task lists, designed to demonstrate the concepts of RESTful APIs.

Uses [PostgreSQL](https://www.postgresql.org/) as database.

## Prerequisites

- Docker Engine
- Node.js (`v20.11.0`)
- pnpm (`v8.x.x`)

## Getting Started & Installation

Clone this repo and cd into it then run:

```bash
$ pnpm install
```

## Running the app locally

1. Start docker containers (database & adminer):

   ```bash
   $ docker-compose up -d
   ```

2. Create a `.env` file from `.sample.env` and configure the mandatory env variables.

3. Migrate the database

   ```bash
   $ npx prisma migrate dev
   ```

4. Start NestJS app:

   ```bash
   # development
   $ pnpm run start

   # watch mode
   $ pnpm run start:dev
   ```

## Using the app

Access UI at `localhost:3000/api`.

Access database admin UI at `localhost:8080`.

Local database credentials are:

```
username: postgres
password: postgres
database: tasks
```
