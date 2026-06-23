import pg from 'pg';
import type { DBConnection, QueryResult } from './types.js';

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export class PostgresDB implements DBConnection {
  private pool: pg.Pool | null = null;

  constructor(private readonly config: PostgresConfig) {}

  async connect(): Promise<void> {
    this.pool = new pg.Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      max: 5,
    });
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  private get client(): pg.Pool {
    if (!this.pool) {
      throw new Error('PostgreSQL pool is not initialized');
    }
    return this.pool;
  }

  async listTables(schema?: string): Promise<Record<string, unknown>[]> {
    const schemaName = schema ?? 'public';
    const { rows } = await this.client.query(
      `SELECT table_schema, table_name, table_type
       FROM information_schema.tables
       WHERE table_schema = $1
       ORDER BY table_name`,
      [schemaName]
    );
    return rows;
  }

  async describeTable(tableName: string, schema?: string): Promise<Record<string, unknown>> {
    const schemaName = schema ?? 'public';

    const { rows: columns } = await this.client.query(
      `SELECT column_name, data_type, character_maximum_length,
              numeric_precision, numeric_scale, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [schemaName, tableName]
    );

    const { rows: constraints } = await this.client.query(
      `SELECT tc.constraint_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table,
              ccu.column_name AS foreign_column
       FROM information_schema.table_constraints tc
       LEFT JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       LEFT JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
       WHERE tc.table_schema = $1 AND tc.table_name = $2`,
      [schemaName, tableName]
    );

    return { schema: schemaName, table: tableName, columns, constraints };
  }

  async executeQuery(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>[]> {
    const values = Object.values(params);
    const { rows } = await this.client.query(sql, values);
    return rows;
  }

  async executeDml(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<QueryResult> {
    const values = Object.values(params);
    const { rowCount } = await this.client.query(sql, values);
    return {
      rowCount: rowCount ?? 0,
      message: 'Executed successfully',
    };
  }
}
