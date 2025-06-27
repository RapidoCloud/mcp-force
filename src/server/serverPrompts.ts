import { GetPromptRequest, ListPromptsResult } from '@modelcontextprotocol/sdk/types.js';

import { PROMPTS } from './prompts/promptDetails.js';
import { setDependencyAnalysisData, getLastAnalysisData } from './serverResources.js';

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
  } // Special handling for code-dependency-analysis prompt
  if (request.params.name === 'code-dependency-analysis') {
    // First, try to load any existing real data from file
    const existingData = getLastAnalysisData();

    // Check if real analysis data is provided in the arguments
    const realAnalysisData = request.params.arguments?.analysis_data;

    if (realAnalysisData && typeof realAnalysisData === 'object') {
      // Use the real analysis data provided in arguments
      console.error('Using real analysis data from arguments:', (realAnalysisData as any)?.target?.name || 'unknown');
      setDependencyAnalysisData(realAnalysisData);
    } else if (existingData && existingData.target) {
      // Use existing real data from file
      console.error('Using existing real analysis data from file:', existingData.target.name);
      setDependencyAnalysisData(existingData);
    } else {
      // Create minimal placeholder data that will be replaced with real analysis
      const targetItem = request.params.arguments?.target_item || 'Unknown';
      const language = request.params.arguments?.language || 'apex';

      console.error('No real analysis data found, creating minimal placeholder for:', targetItem);
      const minimalData = createMinimalPlaceholder(targetItem, language);
      setDependencyAnalysisData(minimalData);
    }
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

// Function to directly store real analysis data (bypassing prompt system)
export function storeRealAnalysisData(analysisData: any): void {
  console.error('Storing real analysis data:', analysisData?.target?.name || 'unknown target');
  setDependencyAnalysisData(analysisData);
}

function createMinimalPlaceholder(targetItem: string, language: string): any {
  // Create minimal placeholder data - no sample dependencies, just structure
  return {
    target: {
      name: targetItem,
      type: 'unknown',
      source: `${targetItem}`,
      id: `target-${targetItem.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    },
    dependencies: [], // Empty - will be filled with real data
    analyzed_items: [targetItem],
    circular_dependencies: [],
    total_levels: 0,
    metadata: {
      language: language,
      analysis_level: 0,
      timestamp: new Date().toISOString(),
      status: 'placeholder - awaiting real analysis data',
    },
  };
}
