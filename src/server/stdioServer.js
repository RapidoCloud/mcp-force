import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { setupServer } from './setupServer.js';

export async function stdioServer(SERVER_NAME, SERVER_VERSION) {
  // stdio mode: single server instance
  const server = setupServer(SERVER_NAME, SERVER_VERSION);

  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
