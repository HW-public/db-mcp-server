declare module 'oracledb' {
  // Minimal type declarations for the oracledb Node.js driver.
  // The npm package does not ship TypeScript definitions.

  export const OUT_FORMAT_OBJECT: number;

  export function createPool(config: unknown): Promise<Pool>;
  export function initOracleClient(options?: unknown): void;

  export const defaults: { configDir: string };

  export interface Pool {
    getConnection(): Promise<Connection>;
    close(force?: number): Promise<void>;
  }

  export interface Connection {
    execute<T>(
      sql: string,
      binds?: unknown,
      options?: unknown
    ): Promise<Result<T>>;
    close(): Promise<void>;
  }

  export interface Result<T> {
    rows?: T[];
    rowsAffected?: number;
    metaData?: Metadata<DBObject>;
  }

  export type Metadata<T> = unknown;
  export type DBObject = unknown;
  export interface ExecuteOptions {
    [key: string]: unknown;
  }
}
