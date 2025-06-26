#!/usr/bin/env node

import dotenv from 'dotenv';

import { sseServer } from './server/sseServer.js';
import { stdioServer } from './server/stdioServer.js';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const SERVER_NAME = 'mcpforce';
const SERVER_VERSION = '0.1.0';

async function run() {
  const args = process.argv.slice(2);
  const isSSE = args.includes('--sse');

  if (isSSE) sseServer(SERVER_NAME, SERVER_VERSION);
  else stdioServer(SERVER_NAME, SERVER_VERSION);
}

run().catch(console.error);
