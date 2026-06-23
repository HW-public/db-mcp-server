# DB MCP Server

[English](README.EN.md) | 中文

一个基于 TypeScript 实现的 [Model Context Protocol](https://modelcontextprotocol.io/) 服务，让 Claude Code 可以直接查询 **Oracle** 和 **PostgreSQL** 数据库。

## 支持的数据库

- Oracle（通过 `oracledb` 驱动，默认 thin 模式）
- PostgreSQL（通过 `pg` 驱动）

## 提供的工具

- `list_tables`：列出指定 schema 下的表
- `describe_table`：查看表结构、字段类型和约束
- `execute_query`：执行只读的 `SELECT` 查询
- `execute_dml`：执行 `INSERT`/`UPDATE`/`DELETE`/`DDL` 语句

每个工具都支持可选参数 `dataSource`（`"oracle"` 或 `"postgres"`）。如果只配置了一种数据库，会默认使用该数据库。

## 环境要求

- Node.js 20+
- 至少配置一个数据库的环境变量

## 安装

```powershell
cd C:\Users\ASUS\db-mcp-server
npm install
npm run build
```

## 配置

在启动 Claude Code 之前设置环境变量：

```powershell
# Oracle 配置
$env:ORACLE_USER = "your_user"
$env:ORACLE_PASSWORD = "your_password"
$env:ORACLE_DSN = "localhost:1521/ORCLPDB1"

# PostgreSQL 配置
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
$env:POSTGRES_USER = "your_user"
$env:POSTGRES_PASSWORD = "your_password"
$env:POSTGRES_DATABASE = "your_db"

claude
```

## Claude Code 集成

该服务已在 `C:\Users\ASUS\.mcp.json` 中注册为 `db-mcp-server`，并在 `C:\Users\ASUS\.claude\settings.local.json` 中启用。

修改环境变量或重新构建后，请重启 Claude Code。

## 构建与运行

```powershell
npm run build
node dist/index.js
```

## 开发调试

无需编译，直接使用 `tsx` 运行：

```powershell
npx tsx src/index.ts
```

## Oracle Thick 模式

如果数据库需要使用 thick 模式，请设置：

```powershell
$env:ORACLE_THICK_MODE = "1"
$env:ORACLE_LIB_DIR = "C:\Users\ASUS\Desktop\instantclient_19_28"
```

## 验证

重启 Claude Code 后，可以尝试：

- "列出 Oracle 的表"
- "列出 PostgreSQL 的表"
- "描述 postgres 中的 users 表"
- "在 oracle 上执行 SELECT * FROM employees"
