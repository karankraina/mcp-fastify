import { test } from 'tap';
import { build, initializeSession, createToolCallPayload, parseSSEResponse } from '../helper.js';
import { isMCPErrorResponse, isMCPSuccessResponse, MCPResponse } from '../types.js';

test('divide_numbers tool should divide two positive numbers', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
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

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Result: 5 (10 ÷ 2)', 'Should return correct division result');
  }

});

test('divide_numbers tool should handle division by zero', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 0
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Error: Division by zero is not allowed', 'Should return division by zero error');
  }

});

test('divide_numbers tool should handle decimal division with precision', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 3,
      precision: 2
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Result: 3.33 (10 ÷ 3)', 'Should return result with correct precision');
  }

});

test('divide_numbers tool should handle negative numbers', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: -10,
      divisor: 2
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Result: -5 (-10 ÷ 2)', 'Should handle negative dividend correctly');
  }

});

test('divide_numbers tool should handle invalid precision - negative', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 3,
      precision: -1
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Error: Precision must be between 0 and 20', 'Should return precision error');
  }

});

test('divide_numbers tool should handle invalid precision - too high', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: 3,
      precision: 25
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Error: Precision must be between 0 and 20', 'Should return precision error');
  }

});

test('divide_numbers tool should handle infinite dividend', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: Infinity,
      divisor: 2
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.ok(result.error.message.includes('Invalid arguments'), 'Should return MCP validation error for Infinity');
  } else {
    t.equal(result.result.content[0].text, 'Error: Dividend must be a finite number', 'Should return infinite dividend error');
  }
});

test('divide_numbers tool should handle infinite divisor', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 10,
      divisor: Infinity
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPSuccessResponse(result)) {
    t.fail('Should return error');
  } else {
    t.type(result.error, 'object', 'Should return error object');
    t.type(String(result.error.code), "-32602", 'Should return error code');
    t.equal(result.error.message.includes("Invalid arguments for tool divide_numbers"), true, 'Should return infinite dividend error');
  }

});

test('divide_numbers tool should handle NaN dividend', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: NaN,
      divisor: 2
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.ok(result.error.message.includes('Invalid arguments'), 'Should return MCP validation error for NaN');
  } else {
    t.equal(result.result.content[0].text, 'Error: Dividend must be a finite number', 'Should return NaN dividend error');
  }
});

test('divide_numbers tool should handle default precision', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 22,
      divisor: 7
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);

  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.equal(result.result.content[0].text.includes('3.1428571429'), true, 'Should use default precision of 10');
  }

});

test('divide_numbers tool should handle very small numbers', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: 0.000001,
      divisor: 0.000002,
      precision: 1
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);
  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    if (result.result) {
      t.equal(result.result.content[0].text, 'Result: 0.5 (0.000001 ÷ 0.000002)', 'Should handle very small numbers correctly');
    } else {
      t.fail('Should return result object');
    }
    t.equal(result.result.content[0].text, 'Result: 0.5 (0.000001 ÷ 0.000002)', 'Should handle very small numbers correctly');
  }

});

test('divide_numbers tool should handle non-Error thrown objects', async (t) => {
  const app = await build(t);
  const sessionId = await initializeSession(app);

  if (!sessionId) {
    t.fail('Failed to initialize session');
    return;
  }

  const response = await app.inject({
    method: 'POST',
    url: '/mcp',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'mcp-session-id': sessionId
    },
    payload: createToolCallPayload('divide_numbers', {
      dividend: -999,
      divisor: -999
    })
  });

  t.equal(response.statusCode, 200, 'Should return 200');
  const result = parseSSEResponse<MCPResponse>(response.body);
  
  if (isMCPErrorResponse(result)) {
    t.fail('Should return result object');
  } else {
    t.type(result.result, 'object', 'Should return result object');
    t.type(result.result.content, 'object', 'Should return content array');
    t.equal(result.result.content[0].type, 'text', 'Should return text content');
    t.equal(result.result.content[0].text, 'Error: Non-Error object thrown for testing', 'Should handle non-Error objects correctly');
  }

});
