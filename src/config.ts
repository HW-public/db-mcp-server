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

export interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database?: string;
}

export interface Config {
  oracle?: OracleConfig;
  postgres?: PostgresConfig;
  mysql?: MysqlConfig;
  defaultDataSource?: 'oracle' | 'postgres' | 'mysql';
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

  const mysqlHost = getEnv('MYSQL_HOST');
  const mysqlUser = getEnv('MYSQL_USER');
  const mysqlPassword = getEnv('MYSQL_PASSWORD');

  if (mysqlHost && mysqlUser && mysqlPassword) {
    config.mysql = {
      host: mysqlHost,
      port: parseIntSafe(getEnv('MYSQL_PORT'), 3306),
      user: mysqlUser,
      password: mysqlPassword,
      database: getEnv('MYSQL_DATABASE'),
    };
  }

  if (!config.oracle && !config.postgres && !config.mysql) {
    throw new Error(
      'No database configured. Set Oracle env vars (ORACLE_USER, ORACLE_PASSWORD, ORACLE_DSN), ' +
        'PostgreSQL env vars (POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD), ' +
        'and/or MySQL env vars (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD).'
    );
  }

  if (config.oracle && !config.postgres && !config.mysql) {
    config.defaultDataSource = 'oracle';
  } else if (config.postgres && !config.oracle && !config.mysql) {
    config.defaultDataSource = 'postgres';
  } else if (config.mysql && !config.oracle && !config.postgres) {
    config.defaultDataSource = 'mysql';
  }

  return config;
}
