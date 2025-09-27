export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

export interface MCPToolResult {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface MCPSuccessResponse {
  jsonrpc: '2.0';
  id: number;
  result: MCPToolResult
}

export interface MCPErrorResponse {
  jsonrpc: '2.0';
  id: number;
  error: MCPError;
}

export type MCPResponse = MCPSuccessResponse | MCPErrorResponse;

export function isMCPErrorResponse(response: MCPResponse): response is MCPErrorResponse {
  return 'error' in response;
}

export function isMCPSuccessResponse(response: MCPResponse): response is MCPSuccessResponse {
  return 'result' in response;
}
