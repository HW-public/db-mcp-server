import 'dotenv/config';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config.js';
import { OracleDB } from './db/oracle.js';
import { PostgresDB } from './db/postgres.js';
import type { DBConnection } from './db/types.js';
import { createServer } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();

  const dbMap = new Map<'oracle' | 'postgres', DBConnection>();

  if (config.oracle) {
    const oracle = new OracleDB(config.oracle);
    await oracle.connect();
    dbMap.set('oracle', oracle);
    console.error('Oracle connected');
  }

  if (config.postgres) {
    const postgres = new PostgresDB(config.postgres);
    await postgres.connect();
    dbMap.set('postgres', postgres);
    console.error('PostgreSQL connected');
  }

  const server = createServer(config, dbMap);
  const transport = new StdioServerTransport();

  const cleanup = async (): Promise<void> => {
    for (const db of dbMap.values()) {
      await db.close();
    }
    await server.close();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  await server.connect(transport);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
