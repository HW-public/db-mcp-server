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

本项目强制使用 [pnpm](https://pnpm.io/) 管理依赖。

```powershell
cd C:\Users\ASUS\db-mcp-server
pnpm install
pnpm run build
```

如果你用 `npm install` 或 `yarn install`，`preinstall` 脚本会报错并阻止安装。

## 配置

### 1. 环境变量 / `.env` 文件

支持两种配置方式，优先级如下：

1. **系统环境变量**（最高优先级）
2. 项目根目录下的 **`.env` 文件**

示例 `.env`：

```env
# Oracle 配置
ORACLE_USER=your_user
ORACLE_PASSWORD=your_password
ORACLE_DSN=localhost:1521/ORCLPDB1

# PostgreSQL 配置
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_db
```

也可以在启动 Claude Code 前用 PowerShell 设置：

```powershell
$env:ORACLE_USER = "your_user"
$env:ORACLE_PASSWORD = "your_password"
$env:ORACLE_DSN = "localhost:1521/ORCLPDB1"

$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
$env:POSTGRES_USER = "your_user"
$env:POSTGRES_PASSWORD = "your_password"
$env:POSTGRES_DATABASE = "your_db"

claude
```

### 2. 在 Claude Code 中注册 MCP Server

在 `C:\Users\ASUS\.mcp.json` 中添加：

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

在 `C:\Users\ASUS\.claude\settings.local.json` 中启用：

```json
{
  "enabledMcpjsonServers": [
    "db-mcp-server"
  ]
}
```

修改环境变量、`.mcp.json` 或重新构建后，请**重启 Claude Code** 使配置生效。

## 构建与运行

```powershell
pnpm run build
node dist/index.js
```

## 开发调试

无需编译，直接使用 `tsx` 运行：

```powershell
pnpm tsx src/index.ts
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
