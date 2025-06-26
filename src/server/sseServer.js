import express from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

import { setupServer } from './setupServer.js';

export function sseServer(SERVER_NAME, SERVER_VERSION) {
  const app = express();
  const transports = {};
  const servers = {};

  // SSE mode
  app.get('/sse', async (_req, res) => {
    // Create a new Server instance for each session
    const server = setupServer(SERVER_NAME, SERVER_VERSION);

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

  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
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
