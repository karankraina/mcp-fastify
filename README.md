# MCP Fastify Server Template

A robust template for building **Model Context Protocol (MCP)** servers using Node.js and the Fastify framework. This template provides a solid foundation for creating MCP-compliant servers with TypeScript support, proper error handling, and session management.

## 🚀 Features

- **MCP Protocol Compliance**: Full support for Model Context Protocol specifications
- **Fastify Framework**: High-performance, low-overhead web framework
- **TypeScript Support**: Type-safe development with comprehensive type definitions

## 📋 Prerequisites

- Node.js 22+ 
- npm or yarn package manager
- TypeScript knowledge (recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karankraina/mcp-fastify.git
   cd mcp-fastify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp sample.env .env
   # Edit .env with your configuration
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```
mcp-fastify/
├── src/                    # Source TypeScript files
│   ├── server.ts          # Main server implementation
│   └── tools/             # MCP tools directory
│       ├── index.ts       # Tool registration hub
│       └── divide-numbers.ts # Example divide tool with error handling
├── build/                 # Compiled JavaScript output
├── tests/                 # Test files
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── sample.env            # Environment variables template
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `3001` | No |
| `ENVIRONMENT` | Runtime environment (`development`, `production`, `test`) | `production` | No |

### Server Configuration

The server supports different logging configurations based on the environment:

- **Development**: Pretty-printed logs with timestamps
- **Production**: JSON structured logs
- **Test**: Disabled logging

## 🛠️ Adding New Tools

To add a new MCP tool:

1. **Create a new tool file** in `src/tools/`:
   ```typescript
   // src/tools/your-new-tool.ts
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { z } from "zod";

   export function registerYourNewTool(server: McpServer) {
       server.registerTool(
           "your_tool_name",
           {
               title: "Your Tool Title",
               description: "Description of what your tool does",
               annotations: {
                   destructiveHint: false,
                   openWorldHint: false,
               },
               inputSchema: {
                   param1: z.string().describe("First parameter"),
                   param2: z.number().describe("Second parameter"),
               },
           },
           async ({ param1, param2 }) => {
               try {
                   // Your tool logic here
                   const result = `Processed: ${param1} with ${param2}`;
                   
                   return {
                       content: [{
                           type: "text",
                           text: result,
                       }]
                   };
               } catch (error) {
                   console.error('Error in your tool:', error);
                   return {
                       content: [{
                           type: "text",
                           text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                       }]
                   };
               }
           }
       );
   }
   ```

2. **Register the tool** in `src/tools/index.ts`:
   ```typescript
   import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
   import { registerMultiplyNumbersTool } from "./multiply-numbers.js";
   import { registerYourNewTool } from "./your-new-tool.js";

   export async function registerTools(server: McpServer) {
       await registerMultiplyNumbersTool(server);
       await registerYourNewTool(server);
   }
   ```

3. **Rebuild and test**:
   ```bash
   npm run build
   npm start
   ```



## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Visit the repository at: https://github.com/karankraina/mcp-fastify

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Fastify Documentation](https://www.fastify.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com/) for the Model Context Protocol
- [Fastify Team](https://www.fastify.io/) for the excellent web framework
- Contributors and the open-source community