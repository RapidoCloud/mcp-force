import express, { Request, Response } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

import { DiscoverToolsOptions } from '@rapidocloud/mcp-tools';
import { setupServer } from './setupServer.js';
import { readDependencyResource, getLastAnalysisData, readResourceRequest } from './serverResources.js';

// Import the global analysis data getter function

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

  // Add middleware for parsing JSON
  app.use(express.json());

  // Add CORS headers for browser compatibility
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // HTTP endpoint for dependency viewer
  app.get('/dependency-viewer', async (req: Request, res: Response) => {
    console.error('### SSE /dependency-viewer ...');
    try {
      // Get the actual analysis data if available, otherwise use sample data
      let analysisData = getLastAnalysisData();

      if (!analysisData) {
        // Fallback to sample data for demonstration
        analysisData = {
          target: {
            name: 'none',
            type: 'none',
            source: 'src/classes/none.cls',
            id: 'none',
          },
          dependencies: [],
          analyzed_items: ['none'],
          circular_dependencies: [],
          metadata: {
            language: 'Apex',
            analysis_level: 1,
            timestamp: new Date().toISOString(),
            note: 'none',
          },
        };
      }

      // Get the dependency viewer HTML with embedded data
      const result = readDependencyResource('dependency-tree://viewer', analysisData);
      res.setHeader('Content-Type', 'text/html');
      res.send(result.contents[0].text);
    } catch (error) {
      console.error('Error serving dependency viewer:', error);
      res.status(500).send('Error loading dependency viewer');
    }
  });

  // Minimal dependency viewer launcher
  app.get('/dependency-viewer/minimal', async (req: Request, res: Response) => {
    console.error('### SSE /dependency-viewer/minimal ...');
    try {
      const result = await readResourceRequest({ params: { uri: 'dependency-viewer://minimal' } });
      res.setHeader('Content-Type', 'text/html');
      res.send(result.contents[0].text);
    } catch (error) {
      console.error('Error serving minimal dependency viewer:', error);
      res.status(500).send('Error loading minimal dependency viewer');
    }
  });

  // Full dependency viewer HTML
  app.get('/dependency-viewer/full', async (req: Request, res: Response) => {
    console.error('### SSE /dependency-viewer/full ...');
    try {
      const result = await readResourceRequest({ params: { uri: 'dependency-viewer://html' } });
      res.setHeader('Content-Type', 'text/html');
      res.send(result.contents[0].text);
    } catch (error) {
      console.error('Error serving full dependency viewer:', error);
      res.status(500).send('Error loading full dependency viewer');
    }
  });

  // Dependency analysis data endpoint
  app.get('/dependecy-analysis/data', async (req: Request, res: Response) => {
    console.error('### SSE /dependecy-analysis/data ...');

    try {
      const result = await readResourceRequest({ params: { uri: 'dependency-analysis://data' } });
      res.setHeader('Content-Type', 'application/json');
      res.send(result.contents[0].text);
    } catch (error) {
      console.error('Error serving dependency analysis data:', error);
      res.status(404).json({ error: 'No dependency analysis data available' });
    }
  });

  // SSE mode
  app.get('/sse', async (_req: Request, res: Response) => {
    console.error('### SSE ...');

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
    console.error('### SSE /messages ...');

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
    console.error(`[SSE Server] running on port ${port}`);
  });
}
