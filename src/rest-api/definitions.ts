import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { rest_api_query, rest_api_search, rest_api_retrieve } from './operations.js';

export const tools: { function: any; definition: Tool }[] = [
  {
    function: rest_api_query,
    definition: {
      name: 'rest_api_query',
      description: 'Query data records from the Salesforce REST API with SOQL',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'SOQL query to send to Salesforce',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    function: rest_api_search,
    definition: {
      name: 'rest_api_search',
      description: 'Find data records with the Salesforce REST API with SOSL',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'SOSL query to send to Salesforce',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    function: rest_api_retrieve,
    definition: {
      name: 'rest_api_retrieve',
      description: 'Retrieve a single data record by its id with the Salesforce REST API',
      inputSchema: {
        type: 'object',
        properties: {
          objectName: {
            type: 'string',
            description: 'Name of the Salesforce object to retrieve',
          },
          recordId: {
            type: 'string',
            description: 'Id of the Salesforce record to retrieve',
          },
        },
        required: ['objectName', 'recordId'],
      },
    },
  },
];

export default tools;
