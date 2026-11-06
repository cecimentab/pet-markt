# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

PetMarkt is an Nx monorepo with two apps:

- `apps/pet-markt-web` — Angular 22 storefront (standalone components, SSR, Apollo GraphQL client, NgRx Signals stores)
- `apps/pet-markt-be` — NestJS 11 GraphQL API (code-first Apollo) backed by Prisma 8 / PostgreSQL

Plus Playwright e2e projects `pet-markt-web-e2e` and `pet-markt-be-e2e`. The `packages/*` workspace is currently empty.

Nx project names differ from directory names: the backend project is **`@pet-markt/pet-markt-be`**, the frontend is **`pet-markt-web`**. Use these exact names with `nx`.

## Commands

All tasks run through Nx (prefix with `npx`). The web app project name is `pet-markt-web`; the backend is `@pet-markt/pet-markt-be`.

```sh
# Run (both needed for a working app)
npx nx serve pet-markt-web              # Angular SSR dev server on :4200
npx nx serve @pet-markt/pet-markt-be    # NestJS on :3000 (REST under /api, GraphQL at /graphql)

# Build
npx nx build pet-markt-web
npx nx build @pet-markt/pet-markt-be

# Test (Jest)
npx nx test pet-markt-web
npx nx test @pet-markt/pet-markt-be
npx nx test pet-markt-web -t "adds to cart"        # single test by name
npx nx test pet-markt-web --testFile=cart.spec.ts  # single file

# Lint / typecheck
npx nx lint pet-markt-web
npx nx typecheck pet-markt-web                      # ngc + tsc --noEmit
npx nx run-many -t typecheck                        # all projects (also runs in pre-commit)

# e2e (Playwright)
npx nx e2e pet-markt-web-e2e

# Anything across all projects
npx nx run-many -t <target>
```

The frontend's Apollo client points at `http://localhost:3000/graphql` and the backend CORS-allows `http://localhost:4200`, so both dev servers must run together. The web dev server's CSP only permits `connect-src` to `localhost:3000`.

A Husky `pre-commit` hook runs `lint-staged` (eslint --fix + prettier) and `nx run-many -t typecheck`.

## Backend architecture (NestJS + GraphQL + Prisma 8)

GraphQL is **code-first**: `GraphQLModule.forRoot` with `autoSchemaFile` (emitted to `apps/pet-markt-be/dist/schema.gql`). The schema is generated from decorators — never hand-edit a `.gql` schema.

Each feature (`products`, `orders`, `checkout`) is a Nest module with this shape:

- `entities/*.entity.ts` — `@ObjectType()` classes with `@Field()` decorators (the GraphQL types). Use `@Field(() => Float)` / `@Field(() => Boolean)` etc. where the scalar isn't inferable.
- `dto/create-*.input.ts`, `dto/update-*.input.ts` — `@InputType()` args
- `*.resolver.ts` — `@Query` / `@Mutation` methods delegating to the service
- `*.service.ts` — business logic and all database access

### Prisma 8 ORM (not classic Prisma Client)

This uses the new `@prisma/orm-postgres` contract-based ORM, which behaves differently from the Prisma Client most people know:

- The schema is a **contract** at `apps/pet-markt-be/src/prisma/contract.prisma`. The query API is accessed through `db` from `apps/pet-markt-be/src/prisma/db.ts`, e.g. `db.orm.public.Product.all()`, `.where({ id }).first()`, `.where(p => or(p.name.ilike(...), ...)).all()`, `.include('items', oi => oi.include('product')).create({...})`.
- **After editing `contract.prisma`, run `npx prisma contract emit`** (or `npm run contract:emit`) from `apps/pet-markt-be` to regenerate the committed `contract.json` and `contract.d.ts`. The runtime loads `contract.json`; types come from `contract.d.ts`. Both are committed.
- Other CLI commands (run in `apps/pet-markt-be`): `npx prisma db init` (create tables), `npx prisma migration status`. Config is `prisma.config.ts`; migrations live in `apps/pet-markt-be/migrations/`.
- Seed data: `apps/pet-markt-be/src/prisma/seed.ts` (products defined in `productList.ts`), idempotent on `stripePriceId`.
- Requires PostgreSQL >= 15. Connection is `DATABASE_URL` in `.env` (copy from `.env.example`).
- See `apps/pet-markt-be/prisma-8.md` for the full ORM reference.

### Backend tests

Jest uses SWC and **mocks the database** — `jest.config.cts` maps `../prisma/db` and `@prisma/orm-postgres/orm-client` to stubs in `src/prisma/__mocks__/`, so specs never open a DB connection or load the ESM-only runtime. Override behavior per test with `jest.spyOn` or by assigning to `db.orm`. Services instantiate via `Test.createTestingModule`.

Note: several service methods (e.g. `ProductsService.create`/`remove`, `OrdersService.findAll`/`update`/`remove`) are still Nest-scaffold stubs returning placeholder strings — they are not implemented.

## Frontend architecture (Angular 22)

- **Standalone components**, no NgModules. Routes in `app.routes.ts` all use lazy `loadComponent`. SSR is configured (`app.config.server.ts`, `server.ts`, `main.server.ts`) with client hydration + event replay.
- Component files use the flat Angular naming convention: `foo.ts`, `foo.html`, `foo.scss`, `foo.spec.ts` (the class is `Foo`, not `FooComponent`). Components live under `src/app/<feature>/` and shared ones under `src/app/components/`.
- **State via NgRx Signals** (`@ngrx/signals` `signalStore`) in `src/app/stores/`, both `providedIn: 'root'`:
  - `ProductStore` — fetches products over Apollo (`watchQuery` for the list, `query` for search); holds `loading`/`error`.
  - `CartStore` — cart items with `totalItems`/`totalAmount` computed signals; **persisted to `localStorage`** under `pet_markt_cart`. Because of SSR, the store guards `localStorage` access with `'localStorage' in globalThis`; keep any new storage access SSR-safe.
- **Apollo** is provided in `app.config.ts`. GraphQL queries are written inline with `gql` in the stores/components.
- Styling: SCSS + Tailwind CSS v4 (via PostCSS) with daisyUI.

## Conventions

- Prettier (`.prettierrc`: single quotes) + ESLint (flat config, `eslint.config.mjs` per project extending `eslint.base.config.mjs`). Nx module-boundary rules apply.
- TypeScript is strict across the workspace (`tsconfig.base.json`).
- ESM: root `package.json` is `"type": "module"`; several config files use `.cjs`/`.cts` where CommonJS is required.
