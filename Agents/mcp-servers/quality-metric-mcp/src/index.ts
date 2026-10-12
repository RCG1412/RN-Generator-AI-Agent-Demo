import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function splitSentences(text: string): string[] { return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 0); }
function detectPassiveVoice(sentences: string[]): string[] {
    const patterns = [/\b(is|are|was|were|been|being)\s+\w+(?:ed|en)\b/gi];
    return sentences.filter(s => patterns.some(p => { p.lastIndex = 0; return p.test(s); }));
}

const server = new McpServer({ name: "quality-metric-mcp", version: "1.0.0" });

server.tool("check_style_violations", "Checks text for style violations.", { text: z.string() }, async ({ text }) => {
    const sentences = splitSentences(text); const violations: any[] = [];
    const RULES = [{ pattern: /\bclick on\b/gi, bad: "click on", fix: "click", rule: "No 'on' after click." }, { pattern: /\butilize\b/gi, bad: "utilize", fix: "use", rule: "Use 'use'." }];
    for (const s of sentences) { for (const r of RULES) { r.pattern.lastIndex = 0; if (r.pattern.test(s)) { r.pattern.lastIndex = 0; violations.push({ bad_term: r.bad, original_text: s, corrected_text: s.replace(r.pattern, r.fix) }); } } }
    detectPassiveVoice(sentences).forEach(p => violations.push({ bad_term: "passive voice", original_text: p, corrected_text: "[REWRITE]" }));
    return { content: [{ type: "text", text: JSON.stringify({ total_violations: violations.length, violations }, null, 2) }] };
});

server.tool("evaluate_structure", "Evaluates Markdown.", { markdown: z.string() }, async ({ markdown }) => {
    const h1 = markdown.match(/^# .+$/gm); const issues = !h1 ? ["Missing H1."] : h1.length > 1 ? ["Multiple H1s."] : [];
    return { content: [{ type: "text", text: JSON.stringify({ issues, structure_score: Math.max(0, 100 - issues.length * 20) }, null, 2) }] };
});

server.tool("calculate_quality_score", "Calculates score.", { style_violations: z.number(), structure_score: z.number(), completeness: z.number() }, async ({ style_violations, structure_score, completeness }) => {
    const final = Math.max(0, 40 - (style_violations * 5)) + Math.round((structure_score / 100) * 30) + Math.round((completeness / 100) * 30);
    return { content: [{ type: "text", text: JSON.stringify({ final_score: final, grade: final >= 90 ? "A" : final >= 75 ? "B" : "C" }, null, 2) }] };
});

async function main() { const transport = new StdioServerTransport(); await server.connect(transport); console.error("Quality Metric MCP Server is running..."); }
main();