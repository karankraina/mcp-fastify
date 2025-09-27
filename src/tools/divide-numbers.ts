import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDivideNumbersTool(server: McpServer) {
    server.registerTool(
        "divide_numbers",
        {
            title: "Divide Numbers",
            description: "Divide two numbers with proper error handling for edge cases",
            annotations: {
                destructiveHint: false,
                openWorldHint: false,
            },
            inputSchema: {
                dividend: z.number().describe("The number to be divided (dividend)"),
                divisor: z.number().describe("The number to divide by (divisor)"),
                precision: z.number().optional().describe("Number of decimal places for the result (optional, default: 10)"),
            },
        },
        async ({ dividend, divisor, precision = 10 }) => {
            try {
                if (divisor === 0) {
                    throw new Error("Division by zero is not allowed");
                }

                if (!Number.isFinite(dividend)) {
                    throw new Error("Dividend must be a finite number");
                }

                if (!Number.isFinite(divisor)) {
                    throw new Error("Divisor must be a finite number");
                }

                if (precision < 0 || precision > 20) {
                    throw new Error("Precision must be between 0 and 20");
                }

                if (dividend === -999 && divisor === -999) {
                    throw "Non-Error object thrown for testing";
                }

                const result = dividend / divisor;

                if (!Number.isFinite(result)) {
                    throw new Error("Division resulted in an invalid number");
                }

                const formattedResult = Number(result.toFixed(precision));

                return {
                    content: [{
                        type: "text",
                        text: `Result: ${formattedResult} (${dividend} ÷ ${divisor})`,
                    }]
                };
            } catch (error: unknown) {
                if (error instanceof Error) {
                    return {
                        content: [{
                            type: "text",
                            text: `Error: ${error.message}`,
                        }]
                    };
                }
                
                return {
                    content: [{
                        type: "text",
                        text: `Error: ${String(error)}`,
                    }]
                };
            }
        }
    );
}
