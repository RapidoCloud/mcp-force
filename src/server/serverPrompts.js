const PROMPTS = {
  'git-commit': {
    name: 'git-commit',
    description: 'Generate a Git commit message',
    arguments: [
      {
        name: 'changes',
        description: 'Git diff or description of changes',
        required: true,
      },
    ],
    messages: (params) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a concise but descriptive commit message for these changes:\n\n${params.arguments?.changes}`,
        },
      },
    ],
  },
  'explain-code': {
    name: 'explain-code',
    description: 'Explain how code works',
    arguments: [
      {
        name: 'code',
        description: 'Code to explain',
        required: true,
      },
      {
        name: 'language',
        description: 'Programming language',
        required: false,
      },
    ],
    messages: (params) => [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Explain how this ${params.arguments?.language || 'Unknown'} code works:\n\n${params.arguments?.code}`,
        },
      },
    ],
  },
};

export function listPromptsRequest() {
  return {
    prompts: Object.values(PROMPTS),
  };
}

export function getPromptRequest(request) {
  const prompt = PROMPTS[request.params.name];
  if (!prompt) {
    throw new Error(`Prompt not found: ${request.params.name}`);
  }

  if (prompt.messages) {
    return prompt.messages(request.params);
  } else {
    return [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `MCP server configuration error : there is no method defined to process this prompt (${request.params.name})`,
        },
      },
    ];
  }
}
