import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

export function processCommandOptions(options: Record<string, any>): { isStdio: boolean; discoverToolsOptions: DiscoverToolsOptions } {
  // Extract options, preferring the camelCase versions
  const isSSE = options.sse ?? false;
  const isStdio = options.stdio ?? !isSSE; // Default to stdio if not SSE
  const selectedAPIs = options.selectedAPIs || options.selectedapis;
  const barredAPIs = options.barredAPIs || options.barredapis;
  const barredToolNames = options.barredToolNames || options.barredtoolnames;

  if (selectedAPIs) {
    console.log(
      'Selected APIs:',
      selectedAPIs.split(',').map((api: string) => api.trim())
    );
  }
  if (barredAPIs) {
    console.log(
      'Barred APIs:',
      barredAPIs.split(',').map((api: string) => api.trim())
    );
  }
  if (barredToolNames) {
    console.log(
      'Barred Tool Names:',
      barredToolNames.split(',').map((name: string) => name.trim())
    );
  }

  return { isStdio, discoverToolsOptions: { selectedAPIs, barredAPIs, barredToolNames } };
}
