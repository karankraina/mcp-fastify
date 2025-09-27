import { test } from 'tap';
import { build, createMCPPayload, parseSSEResponse, initializeSession, createToolCallPayload, createInitializePayload } from './helper.js';
import { isMCPErrorResponse, MCPResponse } from './types.js';

test('server should return error for invalid session ID', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': 'invalid-session-id'
    },
    payload: createMCPPayload('tools/call', {
      name: 'multiply_numbers',
      arguments: { number1: 5, number2: 3 }
    })
  });
  
  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);
  t.ok(isMCPErrorResponse(result), 'Should return error for invalid session');
});

test('server should return error for request without session ID and not initialize', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    },
    payload: createMCPPayload('tools/call', {
      name: 'multiply_numbers',
      arguments: { number1: 5, number2: 3 }
    })
  });
  
  t.equal(response.statusCode, 200, 'Should return 200');
  const result = JSON.parse(response.body);
  t.equal(result.error.code, -32000, 'Should return error code -32000');
  t.equal(result.error.message, 'Bad Request: No valid session ID provided', 'Should return correct error message');
});

test('server health endpoint should return status', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'GET',
    url: '/health'
  });
  
  t.equal(response.statusCode, 200, 'Should return 200');
  const result = JSON.parse(response.body);
  t.equal(result.status, 'ok', 'Should return ok status');
  t.ok(result.timestamp, 'Should include timestamp');
  t.equal(result.version, '1.0.0', 'Should return version');
});

test('parseSSEResponse should handle regular JSON', async (t) => {
  const jsonResponse = '{"test": "value"}';
  const result = parseSSEResponse(jsonResponse);
  t.equal(result.test, 'value', 'Should parse regular JSON correctly');
});

test('parseSSEResponse should handle SSE without data', async (t) => {
  const sseResponse = 'event: message\n\n';
  
  t.throws(() => {
    parseSSEResponse(sseResponse);
  }, 'Should throw error for SSE without data');
});

test('initializeSession should handle failed initialization', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'  
    },
    payload: { invalid: 'payload' }
  });
  
  t.equal(response.statusCode, 200, 'Should return 200');
  const result = JSON.parse(response.body);
  t.ok(result.error, 'Should return error in response body');
});

test('server should handle session cleanup on transport close', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);
  
  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }
  
  const response1 = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 2
    })
  });
  
  t.equal(response1.statusCode, 200, 'Should work with valid session');
  
  const response2 = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': 'non-existent-session'
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 2
    })
  });
  
  t.equal(response2.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse(response2.body);
  t.ok(result.error, 'Should return error for non-existent session');
});

test('initializeSession should handle error responses', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'  
    },
    payload: createInitializePayload()
  });
  
  t.equal(response.statusCode, 406, 'Should return 406');
  const result = JSON.parse(response.body);
  t.ok(result.error, 'Should return error in response');
  
  const sessionId = await initializeSession(app);
  t.type(sessionId, 'string', 'Should return session ID from headers');
});

test('parseSSEResponse should handle regular JSON responses', async (t) => {
  const jsonResponse = '{"test": "value", "number": 42}';
  const result = parseSSEResponse(jsonResponse);
  
  t.equal(result.test, 'value', 'Should parse JSON correctly');
  t.equal(result.number, 42, 'Should parse numbers correctly');
});

test('parseSSEResponse should handle SSE responses with data', async (t) => {
  const sseResponse = 'event: message\ndata: {"result": "success"}\n\n';
  const result = parseSSEResponse(sseResponse);
  
  t.equal(result.result, 'success', 'Should parse SSE data correctly');
});

test('parseSSEResponse should throw error for SSE without data', async (t) => {
  const sseResponse = 'event: message\nid: 123\n\n';
  
  t.throws(() => {
    parseSSEResponse(sseResponse);
  }, 'Should throw error for SSE without data');
});

test('server should handle GET requests to /mcp endpoint', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'GET',
    url: '/mcp'
  });
  
  t.equal(response.statusCode, 400, 'Should return 400 for GET without session');
});

test('server should handle DELETE requests to /mcp endpoint', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'DELETE',
    url: '/mcp'
  });
  
  t.equal(response.statusCode, 400, 'Should return 400 for DELETE without session');
});