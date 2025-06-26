import { GetPromptRequest, ListPromptsResult } from '@modelcontextprotocol/sdk/types.js';

import { PROMPTS } from './prompts/promptDetails.js';

export function listPromptsRequest(): ListPromptsResult {
  const prompts = Object.values(PROMPTS).map((prompt) => ({
    name: prompt.name,
    description: prompt.description,
    arguments: prompt.arguments,
  }));

  console.error(
    `### Found ${prompts.length} prompts`,
    prompts.map((p) => p.name)
  );

  return { prompts };
}

export function getPromptRequest(request: GetPromptRequest): any {
  const prompt = PROMPTS[request.params.name as keyof typeof PROMPTS];
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  if ('messages' in prompt && prompt.messages) {
    return {
      messages: prompt.messages(request.params),
    };
  } else {
    return {
      messages: [
        {
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `MCP server configuration error : there is no method defined to process this prompt (${request.params.name})`,
          },
        },
      ],
    };
  }
}
