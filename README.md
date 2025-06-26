# MCP Force : an MCP server to expose Salesforce APIs as tools for AI Agents

This program provides an MCP (Model Context Protocol) server that exposes Salesforce APIs as tools for use in AI agents. It enables AI assistants like Claude Desktop and VS Code to interact with your Salesforce organization through natural language.

Currently, the following APIs are covered :

- Salesforce Platform APIs : REST API, Bulk v2 API, GraphQL API, Tooling API, Auth API

## EXPERIMENTAL

This package is experimental.

Please use it ONLY in a sandbox, a developer org or a scratch org. NEVER use this in production : you have been warned.

The APIs provided by MCP Force are defined in the `@rapidocloud/mcp-tools` package on NPMjs.org.
All Salesforce APIs will be connected, depending on user requests : open an issue to ask for more.

Finally, user authentication is manual, for the time being : set an OAuth2 access token in the `.env` file. This will be improved very soon.

## Features

- Connect to Salesforce organizations
- Query and manipulate Salesforce data
- Execute SOQL queries
- Manage Salesforce records
- Integration with VS Code and Claude Desktop

## Setup

### 1. Environment Configuration

Create a `.env` file in your project directory with your Salesforce credentials:

```env
SALESFORCE_ENDPOINT='https://mydomain-dev-ed.developer.my.salesforce.com'

# run this command :
# sf org login web --instance-url ${SALESFORCE_ENDPOINT} --json
SALESFORCE_ACCESS_TOKEN='<your_access_token_here>'

# Set your port : 3001 by default
PORT=3021
```

### 3. Command Line Usage

#### Display the help menu with available commands and options

```bash
npx @rapidocloud/mcp-force@1.0.0-dev.5 --help
```

#### List all the Salesforce API endpoints currently known to MCP Force

```bash
npx @rapidocloud/mcp-force@1.0.0-dev.5  list-tools
```

#### Run a specific version of MCP Force

```bash
npx @rapidocloud/mcp-force@1.0.0-dev.5
```

#### Run the MCP server in default mode with all APIs selected

```bash
npx @rapidocloud/mcp-force run-server
```

#### Run the MCP server only with specified APIs to reduce the number of tools loaded

```bash
npx @rapidocloud/mcp-force run-server --selectedAPIs 'rest,tooling'
```

#### Run the MCP server with all APIs except for specified ones

```bash
npx @rapidocloud/mcp-force run-server --barredAPIs 'bulk'
```

#### Run the MCP server with all API endpoints except for specified tool names

```bash
npx @rapidocloud/mcp-force run-server --barredToolNames 'run_tests_sync, tooling_run_tests_async'
```

#### Run the MCP server with a specific version of MCP Tools, selected APIs and barred APIs

```bash
npm install -g @rapidocloud/mcptools@1.0.0-dev.9 1>&2 && npx @rapidocloud/mcp-force@1.0.0-dev.5 run-server --stdio --selectedAPIs 'rest, tooling, metadata' --barredAPIs 'auth, bulk, graphql'
```

To use this in your MCP server configuration :

```json
{
  "servers": {
    "mcpforce": {
      "command": "bash",
      "args": ["-c", "npm install -g @rapidocloud/mcp-tools@1.0.0-dev.9 1>&2 && npx @rapidocloud/mcp-force@1.0.0-dev.5 run-server --stdio --selectedAPIs 'rest, tooling, metadata' --barredAPIs 'auth, bulk, graphql'"],
      "env": {
        "SALESFORCE_ENDPOINT": "https://mydomain-dev-ed.developer.my.salesforce.com",
        "SALESFORCE_ACCESS_TOKEN": "<your_access_token_here>",
        "PORT": "3021"
      }
    }
  }
}
```

### 4. VS Code Configuration

Create or update `.vscode/mcp.json` to configure the MCP server:

```json
{
  "servers": {
    "mcp-force": {
      "command": "npx",
      "args": ["-y", "@rapidocloud/mcp-force"],
      "env": {
        "SALESFORCE_ENDPOINT": "https://mydomain-dev-ed.developer.my.salesforce.com",
        "SALESFORCE_ACCESS_TOKEN": "<your_access_token_here>",
        "PORT": "3021"
      }
    }
  }
}
```

### 5. Claude Desktop Configuration

Add the MCP server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-force": {
      "command": "npx",
      "args": ["-y", "@rapidocloud/mcp-force"],
      "env": {
        "SALESFORCE_ENDPOINT": "https://mydomain-dev-ed.developer.my.salesforce.com",
        "SALESFORCE_ACCESS_TOKEN": "<your_access_token_here>",
        "PORT": "3021"
      }
    }
  }
}
```

## Installation

No installation required! The MCP server will be automatically downloaded and run using npx when configured in your MCP client.

For development or testing, you can also run it directly:

```bash
npx @rapidocloud/mcp-force list-tools
npx @rapidocloud/mcp-force run-server
```

## Usage Examples

### VS Code Agent Mode

In VS Code with the MCP extension and Agent mode enabled:

1. Open the Command Palette (`Cmd/Ctrl + Shift + P`)
2. Select "MCP: Start Agent Session"
3. Ask the agent:

```
Sum the amount of all open Salesforce opportunities
```

The agent will:

- Connect to your Salesforce org
- Query for open opportunities using SOQL
- Calculate the total amount
- Provide you with the sum and breakdown

### Claude Desktop Agent Mode

In Claude Desktop with the MCP server configured:

1. Start a new conversation
2. Ask Claude:

```
Sum the total amount of all open Salesforce opportunities?
Connect to my Salesforce org and run a query to get this information.
```

Claude will:

- Use the MCP tools to connect to Salesforce
- Execute a SOQL query like: `SELECT Amount FROM Opportunity WHERE IsClosed = false AND Amount != null`
- Sum the amounts and provide a detailed report

Example response:

```
I've connected to your Salesforce org and found the following open opportunities:

Total Open Opportunity Amount: $2,450,000

Breakdown:
- 15 opportunities with amounts ranging from $25,000 to $500,000
- Average deal size: $163,333
- Largest opportunity: $500,000
- Smallest opportunity: $25,000
```

## Troubleshooting

- Ensure your Salesforce credentials are correct in the environment variables
- Verify that your security token is up to date
- Check that the MCP server is properly configured in your client application
- Review the console logs for connection errors
- Make sure you have Node.js 22+ installed for npx to work properly

## Requirements

- Node.js 22+
- Valid Salesforce credentials
- VS Code with MCP extension (for VS Code usage)
- Claude Desktop (for Claude Desktop usage)
