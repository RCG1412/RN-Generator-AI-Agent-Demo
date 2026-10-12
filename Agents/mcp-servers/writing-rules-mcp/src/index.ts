import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const RULES = [
    { pattern: /\bclick on\b/gi, fix: "click" },
    { pattern: /\bselect\b/gi, fix: "click" },
    { pattern: /\butilize\b/gi, fix: "use" },
    { pattern: /\bplease\b/gi, fix: "" },
    { pattern: /\bin order to\b/gi, fix: "to" },
    { pattern: /\bdue to the fact that\b/gi, fix: "because" },
    { pattern: /\bprior to\b/gi, fix: "before" },
    { pattern: /\bsubsequent to\b/gi, fix: "after" },
];

const server = new McpServer({ name: "writing-rules-mcp", version: "1.0.0" });

server.tool(
    "apply_writing_rules",
    "Fixes text based on MS style rules.",
    { text: z.string() },
    async ({ text }) => {
        let fixed = text;
        for (const r of RULES) {
            r.pattern.lastIndex = 0;
            fixed = fixed.replace(r.pattern, r.fix);
        }
        fixed = fixed.replace(/\s{2,}/g, " ").trim();
        return { content: [{ type: "text", text: fixed }] };
    }
);

server.tool(
    "get_writing_rules",
    "Returns all enforced rules.",
    {},
    async () => {
        return {
            content: [{ type: "text", text: JSON.stringify(RULES.map(r => ({ pattern: r.pattern.source, fix: r.fix })), null, 2) }],
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Writing Rules MCP Server is running...");
}

main();