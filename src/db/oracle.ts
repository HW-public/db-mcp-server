import oracledb from 'oracledb';
import type { DBConnection, QueryResult } from './types.js';

export interface OracleConfig {
  user: string;
  password: string;
  dsn: string;
  thickMode?: boolean;
  libDir?: string;
  configDir?: string;
}

export class OracleDB implements DBConnection {
  private pool: oracledb.Pool | null = null;

  constructor(private readonly config: OracleConfig) {}

  async connect(): Promise<void> {
    if (this.config.thickMode) {
      if (this.config.libDir) {
        oracledb.initOracleClient({ libDir: this.config.libDir });
      } else {
        oracledb.initOracleClient();
      }
    }

    if (this.config.configDir) {
      oracledb.defaults.configDir = this.config.configDir;
    }

    this.pool = await oracledb.createPool({
      user: this.config.user,
      password: this.config.password,
      connectString: this.config.dsn,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
    });
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close(0);
      this.pool = null;
    }
  }

  private async execute<T>(
    sql: string,
    params: Record<string, unknown> = {},
    options: oracledb.ExecuteOptions = {}
  ): Promise<{ rows: T[]; metaData?: oracledb.Metadata<oracledb.DBObject> }> {
    if (!this.pool) {
      throw new Error('Oracle pool is not initialized');
    }
    const connection = await this.pool.getConnection();
    try {
      const result = await connection.execute<T>(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options,
      });
      return { rows: (result.rows ?? []) as T[], metaData: result.metaData };
    } finally {
      await connection.close();
    }
  }

  async listTables(schema?: string): Promise<Record<string, unknown>[]> {
    const owner = (schema ?? this.config.user).toUpperCase();
    const { rows } = await this.execute<Record<string, unknown>>(
      `SELECT owner, table_name, tablespace_name, num_rows, last_analyzed
       FROM all_tables
       WHERE owner = :owner
       ORDER BY table_name`,
      { owner }
    );
    return rows;
  }

  async describeTable(tableName: string, schema?: string): Promise<Record<string, unknown>> {
    const owner = (schema ?? this.config.user).toUpperCase();
    const table = tableName.toUpperCase();

    const { rows: columns } = await this.execute<Record<string, unknown>>(
      `SELECT column_id, column_name, data_type, data_length,
              data_precision, data_scale, nullable, data_default
       FROM all_tab_columns
       WHERE owner = :owner AND table_name = :table_name
       ORDER BY column_id`,
      { owner, table_name: table }
    );

    const { rows: constraints } = await this.execute<Record<string, unknown>>(
      `SELECT ac.constraint_name, ac.constraint_type, acc.column_name, ac.search_condition
       FROM all_constraints ac
       JOIN all_cons_columns acc
         ON ac.owner = acc.owner
        AND ac.constraint_name = acc.constraint_name
       WHERE ac.owner = :owner AND ac.table_name = :table_name
       ORDER BY ac.constraint_name, acc.position`,
      { owner, table_name: table }
    );

    return { owner, table, columns, constraints };
  }

  async executeQuery(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<Record<string, unknown>[]> {
    const { rows } = await this.execute<Record<string, unknown>>(sql, params);
    return rows;
  }

  async executeDml(
    sql: string,
    params: Record<string, unknown> = {}
  ): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Oracle pool is not initialized');
    }
    const connection = await this.pool.getConnection();
    try {
      const result = await connection.execute(sql, params, {
        autoCommit: true,
      });
      return {
        rowCount: result.rowsAffected ?? 0,
        message: 'Executed successfully',
      };
    } finally {
      await connection.close();
    }
  }
}
