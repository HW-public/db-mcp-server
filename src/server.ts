import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type { Config } from './config.js';
import type { DBConnection } from './db/types.js';
import { describeTable, executeDml, executeQuery, listTables } from './tools/index.js';

const tools: Tool[] = [
  {
    name: 'list_tables',
    description:
      'List all tables in a schema. Defaults to the configured default database.',
    inputSchema: {
      type: 'object',
      properties: {
        schema: {
          type: 'string',
          description: 'Schema/owner name. Defaults to connected user for Oracle or "public" for PostgreSQL.',
        },
        dataSource: {
          type: 'string',
          enum: ['oracle', 'postgres', 'mysql'],
          description: 'Database to query. Required when multiple databases are configured.',
        },
      },
    },
  },
  {
    name: 'describe_table',
    description:
      'Describe a table: show columns, data types, and constraints.',
    inputSchema: {
      type: 'object',
      properties: {
        table_name: {
          type: 'string',
          description: 'Name of the table to describe.',
        },
        schema: {
          type: 'string',
          description: 'Schema/owner name.',
        },
        dataSource: {
          type: 'string',
          enum: ['oracle', 'postgres', 'mysql'],
          description: 'Database to query. Required when multiple databases are configured.',
        },
      },
      required: ['table_name'],
    },
  },
  {
    name: 'execute_query',
    description: 'Execute a read-only SELECT query.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'A SELECT statement.',
        },
        dataSource: {
          type: 'string',
          enum: ['oracle', 'postgres', 'mysql'],
          description: 'Database to query. Required when multiple databases are configured.',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'execute_dml',
    description: 'Execute INSERT, UPDATE, DELETE, or DDL statements.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'A write statement or DDL.',
        },
        dataSource: {
          type: 'string',
          enum: ['oracle', 'postgres'],
          description: 'Database to execute on. Required when both are configured.',
        },
      },
      required: ['sql'],
    },
  },
];

export function createServer(
  config: Config,
  dbMap: Map<'oracle' | 'postgres' | 'mysql', DBConnection>
): Server {
  const server = new Server(
    {
      name: 'db-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  function resolveDB(dataSource?: string): DBConnection {
    const source = (dataSource ?? config.defaultDataSource) as
      | 'oracle'
      | 'postgres'
      | 'mysql'
      | undefined;

    if (!source) {
      throw new Error(
        'dataSource is required when multiple databases are configured.'
      );
    }

    const db = dbMap.get(source);
    if (!db) {
      throw new Error(`Database '${source}' is not configured.`);
    }

    return db;
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const dataSource = (args?.dataSource as string | undefined) ?? undefined;

    try {
      const db = resolveDB(dataSource);
      let content: string;

      switch (name) {
        case 'list_tables': {
          content = await listTables(db, args?.schema as string | undefined);
          break;
        }
        case 'describe_table': {
          content = await describeTable(
            db,
            args?.table_name as string,
            args?.schema as string | undefined
          );
          break;
        }
        case 'execute_query': {
          content = await executeQuery(db, args?.sql as string);
          break;
        }
        case 'execute_dml': {
          content = await executeDml(db, args?.sql as string);
          break;
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
