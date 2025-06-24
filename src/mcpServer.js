#!/usr/bin/env node

import dotenv from 'dotenv';
import express from 'express';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js';

import { discoverTools } from '@rapidocloud/mcp-tools';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const SERVER_NAME = 'mcpforce';
const SERVER_VERSION = '0.1.0';

async function transformTools(tools) {
  return tools
    .map((tool) => {
      const definitionFunction = tool.definition?.function;
      if (!definitionFunction) {
        console.error('### Tool definition function is missing:', tool);
        return;
      }
      return {
        name: definitionFunction.name,
        description: definitionFunction.description,
        inputSchema: definitionFunction.parameters,
      };
    })
    .filter(Boolean);
}

async function setupServerHandlers(server, tools) {
  // MCP Server : list tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await transformTools(tools),
  }));

  // MCP Server : get tools' definitions
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const tool = tools.find((t) => t.definition.function.name === toolName);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
    }
    const args = request.params.arguments;
    const requiredParameters = tool.definition?.function?.parameters?.required || [];
    for (const requiredParameter of requiredParameters) {
      if (!(requiredParameter in args)) {
        throw new McpError(ErrorCode.InvalidParams, `Missing required parameter: ${requiredParameter}`);
      }
    }
    try {
      const result = await tool.function(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error('[Error] Failed to fetch data:', error);
      throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
    }
  });
}

async function run() {
  const args = process.argv.slice(2);
  const isSSE = args.includes('--sse');
  const tools = await discoverTools();

  if (isSSE) {
    const app = express();
    const transports = {};
    const servers = {};

    // SSE mode
    app.get('/sse', async (_req, res) => {
      // Create a new Server instance for each session
      const server = new Server(
        {
          name: SERVER_NAME,
          version: SERVER_VERSION,
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );
      server.onerror = (error) => console.error('[Error]', error);
      await setupServerHandlers(server, tools);

      const transport = new SSEServerTransport('/messages', res);
      transports[transport.sessionId] = transport;
      servers[transport.sessionId] = server;

      res.on('close', async () => {
        delete transports[transport.sessionId];
        await server.close();
        delete servers[transport.sessionId];
      });

      await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      const sessionId = req.query.sessionId;
      const transport = transports[sessionId];
      const server = servers[sessionId];

      if (transport && server) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send('No transport/server found for sessionId');
      }
    });

    const port = process.env.PORT || 3011;
    app.listen(port, () => {
      console.log(`[SSE Server] running on port ${port}`);
    });
  }

  // STDIO mode
  else {
    // stdio mode: single server instance
    const server = new Server(
      {
        name: SERVER_NAME,
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    server.onerror = (error) => console.error('[Error]', error);
    await setupServerHandlers(server, tools);

    process.on('SIGINT', async () => {
      await server.close();
      process.exit(0);
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

run().catch(console.error);
