import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint, OpenAIAdapter, MCPTool } from '@copilotkit/runtime';
import OpenAI from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Request, Response, NextFunction} from 'express';
// Initialize CopilotRuntime

const openai = new OpenAI(
  {
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3/',
    apiKey: process.env.OPENAI_API_KEY,
  },
);
const serviceAdapter = new OpenAIAdapter({
  keepSystemRole: true,
  openai,
  model: 'ep-20250327133705-8mj7p',
});

export const agent =(req: Request, res: Response,  next: NextFunction) => {

  (async () => {
    const runtime = new CopilotRuntime({
      mcpServers: [{
        endpoint: 'http://0.0.0.0:8000/sse',
      }],
      createMCPClient: async (config) => {
        const  mcpClient = new Client({
          name: 'sse-client',
          version: '1.0.0'
        });
        const sseTransport = new SSEClientTransport(new URL(config.endpoint));

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
      // serviceAdapter: googleGenerativeAIAdapter
      serviceAdapter,
    });

    return handler(req, res);
  })().catch(next);


}