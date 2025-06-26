import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';
import { setupServer } from './setupServer.js';

export async function stdioServer(SERVER_NAME: string, SERVER_VERSION: string, options: DiscoverToolsOptions = {}): Promise<void> {
  // stdio mode: single server instance
  const server = await setupServer(SERVER_NAME, SERVER_VERSION, options);

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
