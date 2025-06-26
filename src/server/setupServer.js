import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { listToolsRequest, callToolRequest } from './serverTools.js';
import { listPromptsRequest, getPromptRequest } from './serverPrompts.js';

export async function setupServer(SERVER_NAME, SERVER_VERSION) {
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

  await setupServerHandlers(server);

  return server;
}

// prettier-ignore
async function setupServerHandlers(server) {
  server.setRequestHandler(ListToolsRequestSchema,   async (       ) => listToolsRequest());
  server.setRequestHandler(CallToolRequestSchema,    async (request) => callToolRequest(request));
  server.setRequestHandler(ListPromptsRequestSchema, async (       ) => listPromptsRequest());
  server.setRequestHandler(GetPromptRequestSchema,   async (request) => getPromptRequest(request));
}
