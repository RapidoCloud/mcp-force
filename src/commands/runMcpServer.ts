import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';

import { sseServer } from '../server/sseServer.js';
import { stdioServer } from '../server/stdioServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SERVER_NAME = 'mcpforce';
const SERVER_VERSION = '0.1.0';

export async function runMcpServer(isSSE: boolean, options: DiscoverToolsOptions = {}) {
  run(isSSE, options).catch(console.error);
}

async function run(isSSE: boolean, options: DiscoverToolsOptions): Promise<void> {
  const args = process.argv.slice(2);

  if (isSSE) {
    // Start SSE server for HTTP dependency viewer
    console.error('Starting SSE server for HTTP dependency viewer...');
    sseServer(SERVER_NAME, SERVER_VERSION, options);
  } else {
    // Check if we should also start SSE server alongside stdio
    const shouldStartSSE = process.env.START_SSE_SERVER === 'true' || args.includes('--with-sse');

    if (shouldStartSSE) {
      console.error('Starting both STDIO and SSE servers...');
      // Start SSE server in background for HTTP endpoints
      sseServer(SERVER_NAME, SERVER_VERSION, options);
      // Small delay to let SSE server start
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Start stdio server (this will block)
    await stdioServer(SERVER_NAME, SERVER_VERSION, options);
  }
}
