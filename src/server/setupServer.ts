import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

import { listToolsRequest, callToolRequest } from './serverTools.js';
import { listPromptsRequest, getPromptRequest } from './serverPrompts.js';
import { listResourcesRequest, readResourceRequest } from './serverResources.js';

export async function setupServer(SERVER_NAME: string, SERVER_VERSION: string, options: DiscoverToolsOptions): Promise<Server> {
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
      },
    }
  );

  server.onerror = (error) => console.error('[Error]', error);

  await setupServerHandlers(server, options);

  return server;
}

// prettier-ignore
async function setupServerHandlers(server: Server, options:DiscoverToolsOptions): Promise<void> {
  // list capabilities
  server.setRequestHandler(ListToolsRequestSchema,     async (       ) => listToolsRequest(options));
  server.setRequestHandler(ListPromptsRequestSchema,   async (       ) => listPromptsRequest());
  server.setRequestHandler(ListResourcesRequestSchema, async (       ) => listResourcesRequest());

  // return responses to requests
  server.setRequestHandler(CallToolRequestSchema,      async (request) => callToolRequest(request, options));
  server.setRequestHandler(GetPromptRequestSchema,     async (request) => getPromptRequest(request));
  server.setRequestHandler(ReadResourceRequestSchema,  async (request) => readResourceRequest(request));
}
