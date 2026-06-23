export interface OracleConfig {
  user: string;
  password: string;
  dsn: string;
  thickMode?: boolean;
  libDir?: string;
  configDir?: string;
}

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export interface Config {
  oracle?: OracleConfig;
  postgres?: PostgresConfig;
  defaultDataSource?: 'oracle' | 'postgres';
}

function getEnv(name: string): string | undefined {
  return process.env[name];
}

function parseIntSafe(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

export function loadConfig(): Config {
  const config: Config = {};

  const oracleUser = getEnv('ORACLE_USER');
  const oraclePassword = getEnv('ORACLE_PASSWORD');
  const oracleDsn = getEnv('ORACLE_DSN');

  if (oracleUser && oraclePassword && oracleDsn) {
    config.oracle = {
      user: oracleUser,
      password: oraclePassword,
      dsn: oracleDsn,
      thickMode: getEnv('ORACLE_THICK_MODE') === '1',
      libDir: getEnv('ORACLE_LIB_DIR'),
      configDir: getEnv('ORACLE_CONFIG_DIR'),
    };
  }

  const postgresHost = getEnv('POSTGRES_HOST');
  const postgresUser = getEnv('POSTGRES_USER');
  const postgresPassword = getEnv('POSTGRES_PASSWORD');

  if (postgresHost && postgresUser && postgresPassword) {
    config.postgres = {
      host: postgresHost,
      port: parseIntSafe(getEnv('POSTGRES_PORT'), 5432),
      user: postgresUser,
      password: postgresPassword,
      database: getEnv('POSTGRES_DATABASE'),
    };
  }

  if (!config.oracle && !config.postgres) {
    throw new Error(
      'No database configured. Set Oracle env vars (ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN) ' +
        'and/or PostgreSQL env vars (POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD).'
    );
  }

  if (config.oracle && !config.postgres) {
    config.defaultDataSource = 'oracle';
  } else if (config.postgres && !config.oracle) {
    config.defaultDataSource = 'postgres';
  }

  return config;
}
