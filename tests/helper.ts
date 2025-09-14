import { FastifyInstance } from 'fastify';
import { Test } from 'tap';
import { createServer } from '../src/server.js';

export async function build(t: Test): Promise<FastifyInstance> {
  process.env.ENVIRONMENT = 'test';
  
  const server = createServer();
  await server.ready();
  
  t.teardown(async () => {
    await server.close();
  });
  
  return server;
}


export function createMCPPayload(method: string, params?: Record<string, unknown>, id: number = 1) {
  return {
    jsonrpc: '2.0' as const,
    id,
    method,
    ...(params && { params })
  };
}


export function createInitializePayload(id: number = 1) {
  return createMCPPayload('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {
      roots: {
        listChanged: true
      },
      sampling: {}
    },
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }, id);
}


export function createToolCallPayload(toolName: string, args: Record<string, unknown>, id: number = 1) {
  return createMCPPayload('tools/call', {
    name: toolName,
    arguments: args
  }, id);
}


export async function initializeSession(app: FastifyInstance): Promise<string | null> {
  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    payload: createInitializePayload()
  });
  
  if (response.statusCode !== 200) {
    console.error('Initialize failed with status:', response.statusCode);
    console.error('Response body:', response.body);
    return null;
  }
  
  parseSSEResponse(response.body);
  
  return response.headers['mcp-session-id'] as string || null;
}

export function parseSSEResponse<T = Record<string, unknown>>(body: string): T {
  if (body.startsWith('event:') || body.includes('data:')) {
    const lines = body.split('\n');
    let jsonData = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        jsonData = line.substring(6);
        break;
      }
    }
    if (jsonData) {
      return JSON.parse(jsonData);
    } else {
      throw new Error('No data found in SSE response');
    }
  } else {
    return JSON.parse(body);
  }
}
