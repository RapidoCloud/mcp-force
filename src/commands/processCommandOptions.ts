import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

export function processCommandOptions(options: Record<string, any>): { isStdio: boolean; discoverToolsOptions: DiscoverToolsOptions } {
  // Extract options, preferring the camelCase versions
  const isSSE = options.sse ?? false;
  const isStdio = options.stdio ?? !isSSE; // Default to stdio unless SSE is explicitly requested
  const selectedAPIs = options.selectedAPIs || options.selectedapis;
  const barredAPIs = options.barredAPIs || options.barredapis;
  const barredToolNames = options.barredToolNames || options.barredtoolnames;

  if (selectedAPIs) {
    console.error(
      'Selected APIs:',
      selectedAPIs.split(',').map((api: string) => api.trim())
    );
  }
  if (barredAPIs) {
    console.error(
      'Barred APIs:',
      barredAPIs.split(',').map((api: string) => api.trim())
    );
  }
  if (barredToolNames) {
    console.error(
      'Barred Tool Names:',
      barredToolNames.split(',').map((name: string) => name.trim())
    );
  }

  return { isStdio, discoverToolsOptions: { selectedAPIs, barredAPIs, barredToolNames } };
}
