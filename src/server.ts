#!/usr/bin/env node

import { Command } from 'commander';
import { runMcpServer } from './commands/runMcpServer.js';
import { listTools } from './commands/listTools.js';
import { processCommandOptions } from './commands/processCommandOptions.js';

const program = new Command();

// "List tools" command
program
  .command('list-tools')
  .description('List all API tools available for the MCP server')
  .option('--selectedAPIs <apis>', 'Comma-separated list of selected APIs to include')
  .option('--selectedapis <apis>', 'Comma-separated list of selected APIs to include (alias)')
  .option('--barredAPIs <apis>', 'Comma-separated list of APIs to exclude')
  .option('--barredapis <apis>', 'Comma-separated list of APIs to exclude (alias)')
  .option('--barredToolNames <names>', 'Comma-separated list of tool names to exclude')
  .option('--barredtoolnames <names>', 'Comma-separated list of tool names to exclude (alias)')
  .action(async (options) => {
    console.log('List tools with options:', options);
    const { discoverToolsOptions } = processCommandOptions(options);
    listTools(discoverToolsOptions);
  });

// "Run server" command
program
  .command('run-server')
  .description('Run the MCP server')
  .option('--stdio', 'stdio mode MCP server (default)')
  .option('--sse', 'SSE mode MCP server')
  .option('--selectedAPIs <apis>', 'Comma-separated list of selected APIs to include')
  .option('--selectedapis <apis>', 'Comma-separated list of selected APIs to include (alias)')
  .option('--barredAPIs <apis>', 'Comma-separated list of APIs to exclude')
  .option('--barredapis <apis>', 'Comma-separated list of APIs to exclude (alias)')
  .option('--barredToolNames <names>', 'Comma-separated list of tool names to exclude')
  .option('--barredtoolnames <names>', 'Comma-separated list of tool names to exclude (alias)')
  .action(async (options) => {
    console.log('Starting MCP server with options:', options);

    const { isStdio, discoverToolsOptions } = processCommandOptions(options);

    runMcpServer(!isStdio, discoverToolsOptions);
  });
program.parse(process.argv);
