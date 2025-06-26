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
    sseServer(SERVER_NAME, SERVER_VERSION, options);
  } else {
    await stdioServer(SERVER_NAME, SERVER_VERSION, options);
  }
}
