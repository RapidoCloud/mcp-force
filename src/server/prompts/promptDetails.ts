export const PROMPTS = {
  'code-dependency-analysis': {
    name: 'code-dependency-analysis',
    description: 'Analyzes code dependencies starting from a given input item and presents results in an interactive tree visualization format',
    arguments: [
      {
        name: 'target_item',
        description: 'The code item to analyze (class name, function name, module name, etc.)',
        required: true,
      },
      {
        name: 'language',
        description: 'Programming language context for the analysis',
        required: true,
      },
      {
        name: 'codebase_context',
        description: 'Additional context about the codebase (file paths, project structure, etc.)',
        required: false,
      },
      {
        name: 'analysis_level',
        description: 'Maximum depth to analyze initially (default: 1)',
        required: false,
      },
    ],
    messages: (params: any) => [
      {
        role: 'system',
        content: {
          type: 'text',
          text: `You are a code dependency analyzer that provides both structured analysis and interactive visualization.
    
    ## Response Format:
    Your response must include:
    1. **Analysis Summary**: Brief overview of findings
    2. **JSON Data**: Structured dependency data
    3. **Visualization**: Reference to the interactive tree viewer
    
    ## JSON Schema:
    {
      "target": { "name": string, "type": string, "source": string, "id": string },
      "dependencies": [{ "name": string, "type": string, "source": string, "relationship": string, "id": string, "expanded": boolean, "circular": boolean }],
      "analyzed_items": string[],
      "circular_dependencies": [{ "from": string, "to": string, "path": string[] }]
    }
    
    ## Visualization Integration:
    After providing your analysis and JSON data, include:
    "📊 **Interactive Visualization**: View the dependency tree at dependency-tree://viewer"
    
    This will render an interactive D3.js tree with your analysis data embedded.`,
        },
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Analyze dependencies for: **${params.arguments?.target_item}** (${params.arguments?.language})
    
    Context: ${params.arguments?.codebase_context ?? ''}
    Analysis Level: ${params.arguments?.analysis_level ?? 1}
    
    Provide:
    1. Summary of findings
    2. Complete JSON dependency data  
    3. Reference to interactive visualization`,
        },
      },

      {
        role: 'user',
        content: {
          type: 'text',
          text: `You are a code dependency analyzer. Your task is to analyze code dependencies starting from a given input item and present results in an interactive tree visualization.

## Input Parameters:
- **target_item**: ${params.arguments?.target_item} (class name, function name, module name, etc.)
- **language**: ${params.arguments?.language} (programming language context)
- **codebase_context**: ${params.arguments?.codebase_context ?? ''} (additional context about the codebase)
- **analysis_level**: ${params.arguments?.analysis_level ?? 1} (maximum depth to analyze initially)

## Analysis Instructions:

1. **Identify the target item** in the provided codebase context
2. **Extract first-level dependencies** and categorize them by type:
   - **Classes**: Other classes this item depends on
   - **Functions/Methods**: External functions or methods called
   - **Modules/Imports**: External modules or libraries imported
   - **Interfaces**: Interfaces implemented or extended
   - **Types**: Custom types or data structures used
   - **Constants/Variables**: External constants or global variables referenced

3. **For each dependency, provide**:
   - **Name**: The exact name of the dependency
   - **Type**: The category (class, function, module, etc.)
   - **Source**: Where it's defined (file path, external library, etc.)
   - **Relationship**: How it's used (inheritance, composition, method call, etc.)

4. **Cycle Detection**: Track all analyzed items to prevent infinite loops. If a circular dependency is detected, mark it clearly.

5. **Output Format**: Structure your response as JSON that can be consumed by the D3.js visualization:

\`\`\`json
{
  "target": {
    "name": "${params.arguments?.target_item}",
    "type": "class|function|module",
    "source": "file_path_or_library",
    "id": "unique_identifier"
  },
  "dependencies": [
    {
      "name": "dependency_name",
      "type": "class|function|module|interface|type|constant",
      "source": "file_path_or_library",
      "relationship": "inherits|imports|calls|implements|uses",
      "id": "unique_identifier",
      "expanded": false,
      "circular": false,
      "children": []
    }
  ],
  "analyzed_items": ["${params.arguments?.target_item}"],
  "circular_dependencies": [
    {
      "from": "item1",
      "to": "item2",
      "path": ["item1", "intermediate", "item2", "item1"]
    }
  ]
}
\`\`\`

## Expansion Instructions:
When user requests expansion of specific dependencies:
1. **Validate request**: Ensure the item hasn't been analyzed before (check analyzed_items)
2. **Analyze dependencies** of the selected item(s)
3. **Update the tree structure** by adding children to the expanded nodes
4. **Mark as expanded**: Set \`expanded: true\` for processed nodes
5. **Detect new cycles**: Check if expansion creates circular dependencies

## Important Notes:
- **Never analyze the same item twice** - use the analyzed_items list to track
- **Mark circular dependencies clearly** but don't expand them
- **Provide meaningful relationship descriptions**
- **Include source location information** when available
- **Handle external/library dependencies** appropriately (mark as external, don't expand unless specifically requested)

## Response Guidelines:
- Start with a brief summary of what was found
- Present the JSON structure
- Highlight any circular dependencies detected
- Suggest logical next steps for expansion
- If no dependencies found, explain why (e.g., leaf node, external library, etc.)

Ready to analyze: ${params.arguments?.target_item}`,
        },
      },
    ],
  },

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
    messages: (params: any) => [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
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
    messages: (params: any) => [
      {
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text: `Explain how this ${params.arguments?.language || 'Unknown'} code works:\n\n${params.arguments?.code}`,
        },
      },
    ],
  },
};
