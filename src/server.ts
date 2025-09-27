import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { registerTools } from "./tools/index.js";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const environment = process.env.ENVIRONMENT || "production";
 
export function createServer(): FastifyInstance {
  const server = fastify({
    logger: envToLogger[environment as keyof typeof envToLogger] ?? true,
  });

  const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

  server.post("/mcp", async (request, reply) => {
    const sessionId = request.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId as string]) {
      transport = transports[sessionId as string];
    } else if (!sessionId && isInitializeRequest(request.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => {
          const unique = randomUUID();
          return unique;
        },
        onsessioninitialized: (genSessionId) => {
          transports[genSessionId] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      const mcpServer = new McpServer(
        {
          name: "template-mcp-server",
          version: "1.0.0",
        },
        {
          capabilities: {
            tools: {},
            resources: {},
            completions: {},
            prompts: {},
          },
          instructions: `
          This MCP server allows LLMs to divide numbers with proper error handling.
          `.trim(),
        }
      );

      registerTools(mcpServer);
      await mcpServer.connect(transport);
    } else {
      reply.send({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(request.raw, reply.raw, request.body);
  });

  const handleSessionRequest = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const sessionId = request.headers["mcp-session-id"] as string | undefined;

    if (!sessionId || !transports[sessionId]) {
      reply.status(400).send("Invalid or missing session ID");
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(request.raw, reply.raw);
  };

  server.get("/mcp", handleSessionRequest);
  server.delete("/mcp", handleSessionRequest);

  server.get("/health", () => {
    return { 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    };
  });

  return server;
}

export const server = createServer();