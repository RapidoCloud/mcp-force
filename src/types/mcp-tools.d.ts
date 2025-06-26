declare module '@rapidocloud/mcp-tools' {
  interface ToolDefinition {
    function: {
      name: string;
      description: string;
      parameters?: {
        type?: string;
        properties?: { [key: string]: any };
        required?: string[];
        [key: string]: any;
      };
    };
  }

  interface Tool {
    definition: ToolDefinition;
    function: (args: any) => Promise<any>;
  }

  export type DiscoverToolsOptions = {
    barredToolNames?: string;
    barredAPIs?: string;
    selectedAPIs?: string;
  };

  export function discoverTools(options?: DiscoverToolsOptions): Promise<Tool[]>;
  export type { Tool };
}
