import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

import { discoverTools } from '@rapidocloud/mcp-tools';

const TOOLS = await discoverTools();

export async function callToolRequest(request) {
  const toolName = request.params.name;
  const tool = TOOLS.find((t) => t.definition.function.name === toolName);
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
}

/**
 * For server.setRequestHandler(ListToolsRequestSchema)
 *
 * @param {*} tools
 * @returns
 */

export async function listToolsRequest() {
  return {
    tools: await transformTools(),
  };
}

async function transformTools() {
  return TOOLS.map((tool) => {
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
  }).filter(Boolean);
}
