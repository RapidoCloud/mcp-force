import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: { function: any; definition: Tool }[] = [
  {
    function: 'list_models',
    definition: {
      name: 'list_models',
      description: 'List all available AI models from Salesforce Models API',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    function: 'generate_text',
    definition: {
      name: 'generate_text',
      description: 'Generate text using Salesforce text completion API',
      inputSchema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            description: 'The model ID to use for text generation',
          },
          prompt: {
            type: 'string',
            description: 'The prompt to generate text from',
          },
          parameters: {
            type: 'object',
            description: 'Optional parameters for text generation',
            properties: {
              temperature: {
                type: 'number',
                description: 'Controls randomness (0-1)',
              },
              max_tokens: {
                type: 'integer',
                description: 'Maximum number of tokens to generate',
              },
            },
          },
        },
        required: ['model', 'prompt'],
      },
    },
  },
  {
    function: 'generate_chat',
    definition: {
      name: 'generate_chat',
      description: 'Generate chat completion using Salesforce chat API',
      inputSchema: {
        type: 'object',
        properties: {
          model: {
            type: 'string',
            description: 'The model ID to use for chat completion',
          },
          messages: {
            type: 'array',
            description: 'Array of messages in the conversation',
            items: {
              type: 'object',
              properties: {
                role: {
                  type: 'string',
                  description: 'Role of the message author (system, user, or assistant)',
                  enum: ['system', 'user', 'assistant'],
                },
                content: {
                  type: 'string',
                  description: 'Content of the message',
                },
              },
              required: ['role', 'content'],
            },
          },
          parameters: {
            type: 'object',
            description: 'Optional parameters for chat completion',
            properties: {
              temperature: {
                type: 'number',
                description: 'Controls randomness (0-1)',
              },
              max_tokens: {
                type: 'integer',
                description: 'Maximum number of tokens to generate',
              },
            },
          },
        },
        required: ['model', 'messages'],
      },
    },
  },
];

export default tools;
