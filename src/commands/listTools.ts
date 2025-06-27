/**
 * List the tools for the CLI list-tools command
 */

import { discoverTools, Tool, DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

interface ToolGroup {
  workspace: string;
  collection: string;
  subcollection: string | null;
}

interface GroupedTools {
  [workspace: string]: {
    [collection: string]: {
      [subcollection: string]: Tool[];
    };
  };
}

export async function listTools(options: DiscoverToolsOptions) {
  const tools = await discoverTools();
  //console.log('### Tools found:', tools);

  if (tools.length === 0) {
    console.log('No tools found. Tools should be organized as:');
    console.log('tools/workspace/collection/request.js\n');
    return;
  }

  // Track function names to detect duplicates
  const functionNameMap = new Map<string, Tool[]>();
  tools.forEach((tool) => {
    const functionName = tool.definition?.function?.name;
    if (functionName) {
      if (!functionNameMap.has(functionName)) {
        functionNameMap.set(functionName, []);
      }
      functionNameMap.get(functionName)!.push(tool);
    }
  });

  // Find duplicates
  const duplicates = new Map<string, Tool[]>();
  functionNameMap.forEach((toolList, functionName) => {
    if (toolList.length > 1) {
      duplicates.set(functionName, toolList);
    }
  });

  console.log('\nAvailable Tools:\n');

  // Group tools by workspace/collection/subcollection
  const groupedTools: GroupedTools = tools.reduce((acc, tool) => {
    // Extract API information from path structure
    // e.g., "salesforce-developers/salesforce-platform-apis/REST/soql-query.js"
    // or "salesforce-developers/salesforce-platform-apis/1Tooling/Sandbox/some-tool.js"
    const pathParts = (tool as any).path.split('/');
    const workspace = pathParts[0] || 'Unknown'; // salesforce-platform-apis (workspace)
    const collection = pathParts[1] || 'Unknown'; // REST, Auth, 1Tooling (collection)
    const subcollection = pathParts[2] && !pathParts[2].endsWith('.js') ? pathParts[2] : null; // (optional)

    //console.log('### paths = ', tool.path, workspace, collection, subcollection);

    if (!acc[workspace]) acc[workspace] = {};
    if (!acc[workspace][collection]) acc[workspace][collection] = {};

    if (subcollection) {
      if (!acc[workspace][collection][subcollection]) acc[workspace][collection][subcollection] = [];
      acc[workspace][collection][subcollection].push(tool);
    } else {
      if (!acc[workspace][collection]['_direct']) acc[workspace][collection]['_direct'] = [];
      acc[workspace][collection]['_direct'].push(tool);
    }

    return acc;
  }, {} as GroupedTools);

  // Print tools in a hierarchical structure
  for (const [workspace, collections] of Object.entries(groupedTools)) {
    console.log(`Workspace: ${workspace}`);

    for (const [collection, subcollections] of Object.entries(collections)) {
      console.log(`  Collection: ${collection}`);

      for (const [subcollection, tools] of Object.entries(subcollections)) {
        if (subcollection === '_direct') {
          // Tools directly in the collection (no subcollection)
          logTools({ workspace, collection, subcollection: null }, tools);
        } else {
          // Tools in a subcollection
          console.log(`    Sub-collection: ${subcollection}`);
          logTools({ workspace, collection, subcollection }, tools);
        }
      }
    }
    console.log('');
  }

  // Display duplicate function names if any exist
  if (duplicates.size > 0) {
    console.log('⚠️  DUPLICATE FUNCTION NAMES DETECTED:\n');
    duplicates.forEach((toolList, functionName) => {
      console.log(`Function name: ${functionName} (found ${toolList.length} times)`);
      toolList.forEach((tool) => {
        console.log(`  - ${(tool as any).path}`);
      });
      console.log('');
    });
    console.log('Note: Duplicate function names may cause conflicts when calling tools.\n');
  }
}

function logTools({ workspace, collection, subcollection }: ToolGroup, tools: Tool[]): void {
  tools.forEach((tool) => {
    const {
      definition: {
        function: { name, description, parameters },
      },
    } = tool;

    console.log(`    ${name}`);
    console.log(`      Workspace: ${workspace || 'Unknown'}`);
    console.log(`      Collection: ${collection || 'Unknown'}`);
    if (subcollection) {
      console.log(`      Sub-collection: ${subcollection}`);
    }
    console.log(`      Description: ${description || 'No description provided'}`);
    if (parameters?.properties) {
      console.log('      Parameters:');
      Object.entries(parameters.properties).forEach(([name, details]: [string, any]) => {
        console.log(`        - ${name}: ${details.description || 'No description'}`);
      });
    }
    console.log('');
  });
}
