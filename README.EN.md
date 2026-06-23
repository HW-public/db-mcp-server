# DB MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io/) server written in TypeScript that lets Claude Code interact with **Oracle**, **PostgreSQL**, and **MySQL** databases.

## Supported Databases

- Oracle (via `oracledb`, thin mode by default)
- PostgreSQL (via `pg`)
- MySQL (via `mysql2`)

## Tools

- `list_tables`: list tables in a schema / database
- `describe_table`: show columns, types, and constraints
- `execute_query`: run read-only `SELECT` queries
- `execute_dml`: run `INSERT`/`UPDATE`/`DELETE`/`DDL` statements

Each tool accepts an optional `dataSource` argument (`"oracle"`, `"postgres"`, or `"mysql"`). If only one database is configured, it is used by default.

## Requirements

- Node.js 20+
- Environment variables for at least one configured database

## Installation

This project requires [pnpm](https://pnpm.io/) for dependency management.

```powershell
cd C:\Users\ASUS\db-mcp-server
pnpm install
pnpm run build
```

Running `npm install` or `yarn install` will be blocked by the `preinstall` script.

## Configuration

### 1. Environment Variables / `.env` File

Configuration is loaded in the following priority order:

1. **System environment variables** (highest priority)
2. **`.env` file** in the project root

Example `.env`:

```env
# Oracle
ORACLE_USER=your_user
ORACLE_PASSWORD=your_password
ORACLE_DSN=localhost:1521/ORCLPDB1

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_db

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_db
```

Or set them in PowerShell before starting Claude Code:

```powershell
$env:ORACLE_USER = "your_user"
$env:ORACLE_PASSWORD = "your_password"
$env:ORACLE_DSN = "localhost:1521/ORCLPDB1"

$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
$env:POSTGRES_USER = "your_user"
$env:POSTGRES_PASSWORD = "your_password"
$env:POSTGRES_DATABASE = "your_db"

$env:MYSQL_HOST = "localhost"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "your_user"
$env:MYSQL_PASSWORD = "your_password"
$env:MYSQL_DATABASE = "your_db"

claude
```

### 2. Register the MCP Server in Claude Code

Add the server to `C:\Users\ASUS\.mcp.json`:

```json
{
  "mcpServers": {
    "db-mcp-server": {
      "command": "cmd",
      "args": [
        "/c",
        "cd /d C:\\Users\\ASUS\\db-mcp-server && node dist\\index.js"
      ]
    }
  }
}
```

Enable it in `C:\Users\ASUS\.claude\settings.local.json`:

```json
{
  "enabledMcpjsonServers": [
    "db-mcp-server"
  ]
}
```

Restart Claude Code after changing environment variables, `.mcp.json`, or rebuilding.

## Build and Run

```powershell
pnpm run build
node dist/index.js
```

## Development

Run directly with `tsx` without compiling:

```powershell
pnpm tsx src/index.ts
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
- "List MySQL tables"
- "Describe table users from postgres"
- "Describe table users from mysql"
- "Run SELECT * FROM employees on oracle"
- "Run SELECT * FROM users on mysql"
