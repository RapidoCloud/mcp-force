import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
// import { ListResourcesRequestSchema, ReadResourceRequestSchema, TextContent, ImageContent } from '@modelcontextprotocol/sdk/types.js';

import dotenv from 'dotenv';
dotenv.config();

import { createSalesforceConnection, ConnectionType } from './auth/connection.js';
import { tools as modelsAPItools } from './models-api';
import { tools as restAPItools } from './rest-api';

const tools = [...modelsAPItools, ...restAPItools];

//const PORT = parseInt(process.env['PORT'] || '3000', 10);

const server = new Server(
  {
    name: 'salesforce-models-bridge',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const conn = await createSalesforceConnection({ connection_type: ConnectionType.VS_Code_SFDX });
  const { name: functionName, arguments: args } = request.params;

  try {
    const tool = tools.find((tool) => tool.function === functionName);
    if (tool) {
      return tool.function(conn, args);
    } else {
      console.error(`Tool not found: ${functionName}`);
      throw new Error(`Tool not found: ${functionName}`);
    }
  } catch (error) {
    console.error(`Tool call error (${functionName}):`, error);
    throw error;
  }
});

async function runServer(): Promise<void> {
  const transport = new StdioServerTransport();
  server.connect(transport).catch(console.error);
}

// First log to stderr
console.error(`Salesforce Models bridge MCP server starting...`);
console.error(`Registering ${tools.length} tools: ${tools.map((t) => t.definition.name).join(', ')}`);

runServer();

process.stdin.on('close', () => {
  console.error('Salesforce Models bridge MCP server closed');
  server.close();
});
