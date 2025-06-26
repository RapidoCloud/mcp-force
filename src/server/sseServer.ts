import express, { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';
import { setupServer } from './setupServer.js';

interface TransportMap {
  [sessionId: string]: SSEServerTransport;
}

interface ServerMap {
  [sessionId: string]: Server;
}

export function sseServer(SERVER_NAME: string, SERVER_VERSION: string, options: DiscoverToolsOptions = {}): void {
  const app = express();
  const transports: TransportMap = {};
  const servers: ServerMap = {};

  // SSE mode
  app.get('/sse', async (_req: Request, res: Response) => {
    // Create a new Server instance for each session
    const server = await setupServer(SERVER_NAME, SERVER_VERSION, options);

    const transport = new SSEServerTransport('/messages', res);
    transports[transport.sessionId] = transport;
    servers[transport.sessionId] = server;

    res.on('close', async () => {
      delete transports[transport.sessionId];
      await server.close();
      delete servers[transport.sessionId];
    });

    await server.connect(transport);
  });

  app.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];
    const server = servers[sessionId];

    if (transport && server) {
      await transport.handlePostMessage(req, res);
    } else {
      res.status(400).send('No transport/server found for sessionId');
    }
  });

  const port = process.env.PORT || 3011;
  app.listen(port, () => {
    console.log(`[SSE Server] running on port ${port}`);
  });
}
