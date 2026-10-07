// Stand-in for @prisma/orm-postgres/orm-client in unit tests (mapped in
// jest.config.cts); the real package is ESM-only and Jest runs CommonJS.
export const or = (...conditions: unknown[]) => ({ or: conditions });
