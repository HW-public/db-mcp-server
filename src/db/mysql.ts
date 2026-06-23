import mysql, { type ExecuteValues } from 'mysql2/promise';
import type { DBConnection, QueryResult } from './types.js';

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export class MysqlDB implements DBConnection {
  private pool: mysql.Pool | null = null;

  constructor(private readonly config: MysqlConfig) {}

  async connect(): Promise<void> {
    this.pool = mysql.createPool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
    });
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  private get client(): mysql.Pool {
    if (!this.pool) {
      throw new Error('MySQL pool is not initialized');
    }
    return this.pool;
  }

  private resolveSchema(schema?: string): string {
    return schema ?? this.config.database ?? '';
  }

  async listTables(schema?: string): Promise<Record<string, unknown>[]> {
    const schemaName = this.resolveSchema(schema);
    if (!schemaName) {
      throw new Error('Schema/database is required for MySQL list_tables');
    }
    const [rows] = await this.client.execute(
      `SELECT table_schema, table_name, table_type
       FROM information_schema.tables
       WHERE table_schema = ?
       ORDER BY table_name`,
      [schemaName]
    );
    return rows as Record<string, unknown>[];
  }

  async describeTable(tableName: string, schema?: string): Promise<Record<string, unknown>> {
    const schemaName = this.resolveSchema(schema);
    if (!schemaName) {
      throw new Error('Schema/database is required for MySQL describe_table');
    }

    const [columns] = await this.client.execute(
      `SELECT column_name, data_type, character_maximum_length,
              numeric_precision, numeric_scale, is_nullable, column_default, ordinal_position
       FROM information_schema.columns
       WHERE table_schema = ? AND table_name = ?
       ORDER BY ordinal_position`,
      [schemaName, tableName]
    );

    const [constraints] = await this.client.execute(
      `SELECT tc.constraint_name, tc.constraint_type, kcu.column_name,
              kcu.referenced_table_name AS foreign_table,
              kcu.referenced_column_name AS foreign_column
       FROM information_schema.table_constraints tc
       LEFT JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = ? AND tc.table_name = ?`,
      [schemaName, tableName]
    );

    return { schema: schemaName, table: tableName, columns, constraints };
  }

  async executeQuery(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>[]> {
    const values = Object.values(params) as ExecuteValues[];
    const [rows] = await this.client.execute(sql, values);
    return rows as Record<string, unknown>[];
  }

  async executeDml(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<QueryResult> {
    const values = Object.values(params) as ExecuteValues[];
    const [result] = await this.client.execute(sql, values);
    const ok = result as mysql.ResultSetHeader;
    return {
      rowCount: ok.affectedRows ?? 0,
      message: 'Executed successfully',
    };
  }
}
