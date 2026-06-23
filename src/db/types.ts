export interface QueryResult {
  rows?: Record<string, unknown>[];
  rowCount?: number;
  message?: string;
}

export interface DBConnection {
  connect(): Promise<void>;
  close(): Promise<void>;
  listTables(schema?: string): Promise<Record<string, unknown>[]>;
  describeTable(tableName: string, schema?: string): Promise<Record<string, unknown>>;
  executeQuery(sql: string, params?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  executeDml(sql: string, params?: Record<string, unknown>): Promise<QueryResult>;
}
