import 'dotenv/config'
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc';
import cors from 'cors';
import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint, OpenAIAdapter, MCPTool } from '@copilotkit/runtime';
import OpenAI from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";


const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Initialize CopilotRuntime

const openai = new OpenAI(
  {
    baseURL: 'https://ark-cn-beijing.bytedance.net/api/v3/',
    apiKey: process.env.OPENAI_API_KEY,
  },
);
const serviceAdapter = new OpenAIAdapter({
  keepSystemRole: true,
  openai,
  model: 'ep-20250327133705-8mj7p',
});


// TODO: Configure with an LLM adapter and API key

// CopilotKit backend endpoint
app.all('/api/copilotkit', (req, res, next) => {

  (async () => {
    const runtime = new CopilotRuntime({
      mcpServers: [{
        endpoint: 'http://0.0.0.0:8000/sse',
      }],
      createMCPClient: async () => {
        const  mcpClient = new Client({
          name: 'sse-client',
          version: '1.0.0'
        });
        const sseTransport = new SSEClientTransport(new URL('http://0.0.0.0:8000/sse'));

        await mcpClient.connect(sseTransport);

        const tools: () => Promise<Record<string, MCPTool>> = async () =>{
          const allTools = await mcpClient.listTools();
          const res = allTools.tools.reduce((acc, tool) => {
            acc[tool.name] = {
              description: tool.description,
              schema: {
                parameters: tool.inputSchema
              },
              execute: async (options) =>  mcpClient.callTool({
                name: tool.name,
                arguments: options.params
              })
            }
            return acc
          }, {} as Record<string, MCPTool>);

          return res
        };

        const close = async () => {};
        return { tools, close };
      }
    });
    const handler = copilotRuntimeNodeHttpEndpoint({
      endpoint: '/api/copilotkit',
      runtime,
      serviceAdapter,
    });

    return handler(req, res);
  })().catch(next);


});

app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
  })
);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`tRPC server running on port ${port}`);
  console.log(`CopilotKit endpoint available at /api/copilotkit (requires LLM configuration)`);
});