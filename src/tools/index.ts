import type { DBConnection } from '../db/types.js';

export async function listTables(
  db: DBConnection,
  schema?: string
): Promise<string> {
  const rows = await db.listTables(schema);
  return JSON.stringify(rows, null, 2);
}

export async function describeTable(
  db: DBConnection,
  tableName: string,
  schema?: string
): Promise<string> {
  const result = await db.describeTable(tableName, schema);
  return JSON.stringify(result, null, 2);
}

export async function executeQuery(
  db: DBConnection,
  sql: string
): Promise<string> {
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) {
    throw new Error('execute_query only allows SELECT statements.');
  }
  const rows = await db.executeQuery(sql);
  return JSON.stringify(rows, null, 2);
}

export async function executeDml(
  db: DBConnection,
  sql: string
): Promise<string> {
  const result = await db.executeDml(sql);
  return JSON.stringify(result, null, 2);
}
