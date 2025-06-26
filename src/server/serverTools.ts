import { McpError, ErrorCode, CallToolRequest, CallToolResult, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';

import { discoverTools, Tool, DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

let TOOLS: Tool[] = [];

export async function callToolRequest(request: CallToolRequest, options: DiscoverToolsOptions): Promise<CallToolResult> {
  TOOLS = await discoverTools(options);

  const toolName = request.params.name;
  const tool = TOOLS.find((t) => t.definition.function.name === toolName);
  if (!tool) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }
  const args = request.params.arguments || {};
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
  } catch (error: any) {
    console.error('[Error] Failed to fetch data:', error);
    throw new McpError(ErrorCode.InternalError, `API error: ${error.message}`);
  }
}

/**
 * For server.setRequestHandler(ListToolsRequestSchema)
 */
export async function listToolsRequest(options: DiscoverToolsOptions): Promise<ListToolsResult> {
  return {
    tools: await transformTools(options),
  };
}

async function transformTools(options: DiscoverToolsOptions) {
  TOOLS = await discoverTools(options);

  return TOOLS.map((tool) => {
    const definitionFunction = tool.definition?.function;
    if (!definitionFunction) {
      console.error('### Tool definition function is missing:', tool);
      return undefined;
    }
    return {
      name: definitionFunction.name,
      description: definitionFunction.description,
      inputSchema: {
        type: 'object' as const,
        properties: definitionFunction.parameters?.properties || {},
        required: definitionFunction.parameters?.required || [],
      },
    };
  }).filter((tool): tool is NonNullable<typeof tool> => tool !== undefined);
}
