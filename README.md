# MCP Force : an MCP server to expose Salesforce APIs as tools for AI Agents

This program provides an MCP (Model Context Protocol) server that exposes Salesforce APIs as tools for use in AI agents. It enables AI assistants like Claude Desktop and VS Code to interact with your Salesforce organization through natural language.

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

### 2. VS Code Configuration

Create or update `.vscode/mcp.json` to configure the MCP server:

```json
{
  "servers": {
    "mcp-force": {
      "command": "npx",
      "args": ["@rapidocloud/mcp-force"],
      "env": {
        "SALESFORCE_ENDPOINT": "https://mydomain-dev-ed.developer.my.salesforce.com",
        "SALESFORCE_ACCESS_TOKEN": "<your_access_token_here>",
        "PORT": "3021"
      }
    }
  }
}
```

### 3. Claude Desktop Configuration

Add the MCP server to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mcp-force": {
      "command": "npx",
      "args": ["@rapidocloud/mcp-force"],
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
npx @rapidocloud/mcp-force
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

## Available Tools

The MCP server provides access to various Salesforce operations through the `@rapidocloud/mcp-tools` package, including:

- Salesforce Auth
- Salesforce REST API
- Salesforce Tooling API
- Salesforce GraphQL API

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
