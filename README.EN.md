# DB MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server written in TypeScript that lets Claude Code interact with **Oracle** and **PostgreSQL** databases.

## Supported Databases

- Oracle (via `oracledb`, thin mode by default)
- PostgreSQL (via `pg`)

## Tools

- `list_tables`: list tables in a schema
- `describe_table`: show columns, types, and constraints
- `execute_query`: run read-only `SELECT` queries
- `execute_dml`: run `INSERT`/`UPDATE`/`DELETE`/`DDL` statements

Each tool accepts an optional `dataSource` argument (`"oracle"` or `"postgres"`). If only one database is configured, it is used by default.

## Requirements

- Node.js 20+
- Environment variables for at least one configured database

## Installation

```powershell
cd C:\Users\ASUS\db-mcp-server
npm install
npm run build
```

## Configuration

Set environment variables before starting Claude Code:

```powershell
# Oracle
$env:ORACLE_USER = "your_user"
$env:ORACLE_PASSWORD = "your_password"
$env:ORACLE_DSN = "localhost:1521/ORCLPDB1"

# PostgreSQL
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
$env:POSTGRES_USER = "your_user"
$env:POSTGRES_PASSWORD = "your_password"
$env:POSTGRES_DATABASE = "your_db"

claude
```

## Claude Code Integration

The server is registered in `C:\Users\ASUS\.mcp.json` as `db-mcp-server` and enabled in `C:\Users\ASUS\.claude\settings.local.json`.

Restart Claude Code after changing environment variables or rebuilding.

## Build and Run

```powershell
npm run build
node dist/index.js
```

## Development

Run directly with `tsx` without compiling:

```powershell
npx tsx src/index.ts
```

## Oracle Thick Mode

If your database requires thick mode, set:

```powershell
$env:ORACLE_THICK_MODE = "1"
$env:ORACLE_LIB_DIR = "C:\Users\ASUS\Desktop\instantclient_19_28"
```

## Verification

After restarting Claude Code, try:

- "List Oracle tables"
- "List PostgreSQL tables"
- "Describe table users from postgres"
- "Run SELECT * FROM employees on oracle"
