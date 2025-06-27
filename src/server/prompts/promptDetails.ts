export const PROMPTS = {
  'code-dependency-analysis': {
    name: 'code-dependency-analysis',
    description: 'Analyzes Salesforce metadata dependencies starting from a given component and presents results in an interactive tree visualization format',
    arguments: [
      {
        name: 'target_item',
        description: 'The Salesforce component to analyze (Apex class name, Flow name, Custom Object API name, Custom Field API name, etc.)',
        required: true,
      },
      {
        name: 'component_type',
        description: 'Type of Salesforce component (ApexClass, Flow, CustomObject, CustomField, Layout, etc.)',
        required: true,
      },
    ],
    messages: (params: any) => {
      // Store analysis parameters for resource generation
      const analysisData = {
        target_item: params.arguments?.target_item,
        component_type: params.arguments?.component_type,
        timestamp: new Date().toISOString(),
      };

      // Store in global scope for resource access
      try {
        (globalThis as any).lastDependencyAnalysis = analysisData;
      } catch (e) {
        console.error('Could not store analysis data globally');
      }

      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `You are a Salesforce metadata dependency analyzer that provides both structured analysis and interactive visualization using the Salesforce Tooling API.

## Your Task:
Analyze dependencies for: **${params.arguments?.target_item}** (${params.arguments?.component_type})

## How to do it:

1. **Find the target component ID** using the Tooling API:
   Query the appropriate object (e.g., ApexClass, Flow, CustomObject) to get the ID of the target component.

2. **Query for dependencies** using the target component ID:
   \`\`\`sql
   SELECT RefMetadataComponentId, RefMetadataComponentName, RefMetadataComponentType
   FROM MetadataComponentDependency 
   WHERE MetadataComponentId = '<targetItemId>'
   \`\`\`

3. **Recursively analyze dependencies** (up to 5 levels deep):
   For each dependency found in step 2, repeat the query using their RefMetadataComponentId as the new MetadataComponentId to find their dependencies. Continue this process for up to 5 levels of depth.
   
   **Important**: Track analyzed component IDs to prevent infinite loops from circular dependencies. If a component ID has already been analyzed in the current dependency path, mark it as circular and stop recursion for that branch.

This approach finds what the target component depends ON (upstream dependencies) in a hierarchical tree structure.

## Supported Component Types in Salesforce:
**Primary Types (Most Reliable):**
- **ApexClass**: Apex classes (includes triggers)
- **Flow**: Flows and Process Builder processes
- **CustomObject**: Custom objects and their relationships
- **CustomField**: Custom fields on standard and custom objects
- **ValidationRule**: Object validation rules
- **WorkflowRule**: Workflow rules (legacy automation)

**Secondary Types (May Have Limited Support):**
- **Layout**: Page layouts and record types
- **CustomTab**: Custom application tabs
- **VisualforcePage**: Visualforce pages and components
- **LightningComponentBundle**: Lightning Web Components/Aura Components
- **CustomLabel**: Custom labels for internationalization
- **CustomApplication**: Custom applications

## Response Format:
Your response must include:
1. **Analysis Summary**: Brief overview of dependencies found (what the target depends on)
2. **Dependencies Table**: Components that the target depends on (UPSTREAM dependencies)
3. **JSON Data**: Complete dependency tree data wrapped in \`\`\`dependency-analysis
4. **Store Real Data**: Call storeRealAnalysisData function
5. **Visualization**: Reference to interactive tree viewer
6. **Limitation Notice**: Explain that due to SOQL restrictions, this shows upstream (not downstream) dependencies

**BETA CONSIDERATIONS:**
- If MetadataComponentDependency queries fail, explain the beta limitations and SOQL restrictions
- Suggest alternative approaches (manual code review, IDE dependency analysis, DevOps Center)
- Focus on the most reliable component types first (ApexClass, Flow, CustomObject)
- Mention that results may be incomplete for complex org structures
- If SOQL errors occur, try removing ORDER BY, COUNT, LIKE, or OFFSET clauses
- Use exact string matching instead of pattern matching (LIKE not supported)

## Query Strategy:
**REMEMBER**: MetadataComponentDependency has strict SOQL limitations (no ORDER BY, COUNT, LIKE, OFFSET, etc.)

1. Start with direct dependencies (Level 1) using only = and AND operators
2. For each result, query for its dependencies (Level 2-5) with exact matches only
3. Handle timeouts gracefully with smaller result sets (reduce LIMIT if needed)
4. Track circular dependencies to avoid infinite loops
5. Use LIMIT clauses but avoid OFFSET for pagination (not supported)
6. If queries fail, try simplified WHERE conditions with fewer filters
7. Focus on exact string matches - no LIKE patterns or wildcards

## CRITICAL: Data Storage
**IMPORTANT**: After providing your analysis, you must store the real data by calling:
\`\`\`javascript
// Store the real analysis data for the dependency viewer
storeRealAnalysisData(your_analysis_data_object);
\`\`\`

## Table Format:
Present the UPSTREAM dependencies in a clear table showing:
- **Referenced Component**: The name of the component that the target depends on
- **Component Type**: ApexClass, Flow, CustomObject, CustomField, Layout, etc.
- **Level**: Dependency depth (1-5)
- **Namespace**: Component namespace (or null for unpackaged)
- **Relationship**: How the target depends on this component (references, extends, uses, etc.)
- **Notes**: Additional context about the dependency (Note: This shows what the target depends ON, not what depends on the target)

## JSON Schema (Complete Tree):
{
  "target": { "name": string, "type": string, "namespace": string, "id": string },
  "dependencies": [{ 
    "name": string, "type": string, "namespace": string, "relationship": string, 
    "id": string, "level": number, "circular": boolean,
    "children": [recursive dependencies up to level 5]
  }],
  "analyzed_items": string[],
  "circular_dependencies": [{ "from": string, "to": string, "path": string[] }],
  "total_levels": 5,
  "metadata": {
    "api_limitations": "MetadataComponentDependency is beta - results may be incomplete. SOQL restrictions: no ORDER BY, COUNT, LIKE, OFFSET, queryMore",
    "query_performance": "Large orgs may experience timeouts. Use simple WHERE conditions with only =, !=, AND, OR operators",
    "soql_restrictions": ["ORDER BY", "COUNT()", "queryMore()", "LIKE with MetadataComponent fields", "OFFSET", "RefMetadataComponentType = 'StandardEntity'"],
    "supported_types": ["ApexClass", "Flow", "CustomObject", "CustomField", "ValidationRule"]
  }
}

## Visualization Integration:
**IMPORTANT**: After providing your analysis and JSON data, you MUST include these instructions:

📊 **Interactive Visualization Available**

**For VS Code MCP Users**: 
Ask Claude to "read the dependency-tree://viewer resource" to display the interactive HTML visualization.

**For SSE/HTTP Mode**: 
If running in SSE mode, open this link: [View Interactive Dependency Tree](http://localhost:${process.env.PORT || 3011}/dependency-viewer)

**For Other MCP Clients**: 
Access the resource dependency-tree://viewer through your client's resource interface.

The interactive tree includes:
- Hierarchical tree view showing all 5 levels of upstream dependencies (what the target depends on)
- Color-coded dependency types (ApexClass, Flow, CustomObject, etc.)
- Tooltips with detailed Salesforce component information
- Zoom and pan functionality for large dependency trees
- Dependency table view with Salesforce-specific metadata
- Raw data toggle for debugging MetadataComponentDependency queries

**Important**: The visualization data shows upstream dependency analysis (what the target depends on) due to SOQL filtering limitations on RefMetadataComponent fields.`,
          },
        },
      ];
    },
  },
};
