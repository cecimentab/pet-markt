// Stand-in for ../db in unit tests (mapped in jest.config.cts) so specs
// don't load the ESM-only Prisma runtime or need a database connection.
// Override per test with jest.spyOn or by assigning to db.orm.
export const db = { orm: {} } as unknown as typeof import('../db').db;
