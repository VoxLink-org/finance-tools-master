import { CopilotRuntime, copilotRuntimeNodeHttpEndpoint, OpenAIAdapter, MCPTool } from '@copilotkit/runtime';
import OpenAI from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Request, Response, NextFunction} from 'express';
import Database from 'better-sqlite3';

interface RateLimitRow {
  count: number;
  last_request: string;
}

// Initialize SQLite database for rate limiting
const db = new Database('rate-limiter.db');
db.pragma('journal_mode = WAL');

// Create rate limit table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    ip TEXT PRIMARY KEY,
    count INTEGER DEFAULT 1,
    last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Rate limiting middleware
const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!ip) return res.status(429).json({
        error: 'Rate limit exceeded - no IP address found'
      });

  // Clean up old entries (older than 24 hours)
  db.prepare(`
    DELETE FROM rate_limits
    WHERE last_request < datetime('now', '-1 day')
  `).run();

  // Get current count for IP
  const row = db.prepare(`
    SELECT count FROM rate_limits
    WHERE ip = ?
  `).get(ip) as RateLimitRow | undefined;

  if (row) {
    if (row.count >= 10) {
      return res.status(429).json({
        error: 'Rate limit exceeded - max 10 requests per day'
      });
    }
    // Increment count
    db.prepare(`
      UPDATE rate_limits
      SET count = count + 1, last_request = CURRENT_TIMESTAMP
      WHERE ip = ?
    `).run(ip);
  } else {
    // Insert new IP
    db.prepare(`
      INSERT INTO rate_limits (ip)
      VALUES (?)
    `).run(ip);
  }

  next();
};
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

export const agent = (req: Request, res: Response, next: NextFunction) => {
  // Apply rate limiting first
  rateLimitMiddleware(req, res, () => {

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
  });


}