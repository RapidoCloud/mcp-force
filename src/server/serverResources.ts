import { ListResourcesResult, ReadResourceResult, GetPromptResult, Resource } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global storage for dependency analysis data - now using MCP resources only
let lastAnalysisData: any = null;

export function setDependencyAnalysisData(data: any) {
  lastAnalysisData = data;
  console.error('Stored dependency analysis data:', data?.target?.name);
}

export function getLastAnalysisData(): any {
  return lastAnalysisData;
}

export async function listResourcesRequest(): Promise<ListResourcesResult> {
  const resources = [...dependencyResourcesList];

  // Dynamically add analysis data resource if analysis data exists
  if (lastAnalysisData) {
    resources.push({
      uri: 'dependency-analysis://data',
      name: 'Dependency Analysis Data',
      description: `Analysis data for ${lastAnalysisData.target?.name || 'Unknown'} with ${lastAnalysisData.dependencies?.length || 0} dependencies`,
      mimeType: 'application/json',
    });
  }

  console.error(
    `### Found ${resources.length} resources`,
    resources.map((r) => r.name)
  );
  return { resources };
}

export async function readResourceRequest(request: { params?: { uri: string } }): Promise<ReadResourceResult> {
  const uri = request.params?.uri ?? '';

  // Handle the analysis data resource
  if (uri === 'dependency-analysis://data') {
    if (!lastAnalysisData) {
      throw new Error('No dependency analysis data available');
    }
    return {
      contents: [
        {
          uri: uri,
          text: JSON.stringify(lastAnalysisData, null, 2),
          mimeType: 'application/json',
        },
      ],
    };
  }

  // Handle the full HTML viewer resource
  if (uri === 'dependency-viewer://html') {
    return {
      contents: [
        {
          uri: uri,
          text: getDependencyViewerHTML(),
          mimeType: 'text/html',
        },
      ],
    };
  }

  // Handle the minimal viewer launcher resource
  if (uri === 'dependency-viewer://minimal') {
    return {
      contents: [
        {
          uri: uri,
          text: getMinimalViewerHTML(),
          mimeType: 'text/html',
        },
      ],
    };
  }

  // Handle legacy viewer resource (for backward compatibility)
  if (uri === 'dependency-tree://viewer') {
    return readDependencyResource(uri, lastAnalysisData);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}

/*********************************************************************
 * PRIVATE FUNCTIONS
 *********************************************************************/

// 1. Resource definitions for ListResourcesResult
const dependencyResourcesList: Resource[] = [
  {
    uri: 'dependency-viewer://minimal',
    name: 'Minimal Dependency Viewer Launcher',
    description: 'Lightweight HTML page that fetches and displays the full dependency viewer from MCP server',
    mimeType: 'text/html',
  },
  {
    uri: 'dependency-viewer://html',
    name: 'Full Dependency Viewer HTML Page',
    description: 'Complete HTML page for interactive dependency visualization that fetches data from MCP server',
    mimeType: 'text/html',
  },
  // Legacy resource for backward compatibility
  {
    uri: 'dependency-tree://viewer',
    name: 'Interactive Dependency Tree Viewer (Legacy)',
    description: 'D3.js-based interactive tree visualization for code dependencies with expandable nodes and cycle detection',
    mimeType: 'text/html',
  },
];

// 3. Resource reader function (legacy support)
export const readDependencyResource = (uri: string, dependencyData?: any): ReadResourceResult => {
  if (uri === 'dependency-tree://viewer') {
    // Use the modern HTML viewer instead of the old template
    return {
      contents: [
        {
          uri,
          mimeType: 'text/html',
          text: getDependencyViewerHTML(),
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
};

// 4. Updated prompt to include visualization
// const getDependencyAnalysisPromptWithVisualization = (args: Record<string, unknown>): GetPromptResult => {
//   const targetItem = args.target_item as string;
//   const language = args.language as string;
//   const codebaseContext = (args.codebase_context as string) || '';
//   const analysisLevel = (args.analysis_level as number) || 1;

//   return {
//     description: 'Code dependency analyzer with integrated D3.js tree visualization',
//     messages: [],
//   };
// };

// 5. MCP Server integration example
// export class DependencyAnalysisMCPServer {
//   private lastAnalysisData: any = null;

//   setupResourceHandlers(server: any) {
//     // List resources
//     server.setRequestHandler('resources/list', async () => {
//       return dependencyResourcesList;
//     });

//     // Read resource
//     server.setRequestHandler('resources/read', async (request: any) => {
//       const { uri } = request.params;
//       return readDependencyResource(uri, this.lastAnalysisData);
//     });
//   }

//   setupPromptHandlers(server: any) {
//     // Get prompt - store analysis data for visualization
//     server.setRequestHandler('prompts/get', async (request: any) => {
//       if (request.params.name === 'code-dependency-analysis') {
//         return getDependencyAnalysisPromptWithVisualization(request.params.arguments || {});
//       }
//       throw new Error(`Unknown prompt: ${request.params.name}`);
//     });
//   }

//   // Call this when analysis is complete to store data for visualization
//   setAnalysisData(data: any) {
//     this.lastAnalysisData = data;
//   }
// }

// Function to return minimal HTML viewer that fetches the full viewer from MCP server
function getMinimalViewerHTML(): string {
  const htmlPath = join(__dirname, 'resources', 'minimal-viewer.html');
  return readFileSync(htmlPath, 'utf-8');
}

// Function to return clean HTML viewer that fetches data from MCP server
function getDependencyViewerHTML(): string {
  const htmlPath = join(__dirname, 'resources', 'dependency-viewer.html');
  return readFileSync(htmlPath, 'utf-8');
}
