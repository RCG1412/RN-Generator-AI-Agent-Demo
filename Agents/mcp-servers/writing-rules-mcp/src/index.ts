import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function detectPassiveVoice(sentence: string): boolean {
  const passivePatterns = [
    /\b(is|are|was|were|been|being)\s+\w+(?:ed|en|wn|ne|lt|pt)\b/gi,
    /\b(is|are|was|were|been|being)\s+being\s+\w+(?:ed|en)\b/gi,
  ];
  for (const pattern of passivePatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(sentence)) return true;
  }
  return false;
}

interface StyleRule {
  pattern: RegExp;
  badTerm: string;
  correction: string;
  rule: string;
}

const WRITING_RULES: StyleRule[] = [
  { pattern: /\bclick on\b/gi, badTerm: "click on", correction: "click", rule: "Do not use 'on' after 'click'." },
  { pattern: /\bselect\b/gi, badTerm: "select", correction: "click", rule: "Use 'click' for mouse actions, not 'select'." },
  { pattern: /\butilize\b/gi, badTerm: "utilize", correction: "use", rule: "Use 'use' instead of 'utilize'." },
  { pattern: /\bin order to\b/gi, badTerm: "in order to", correction: "to", rule: "Use 'to' instead of 'in order to'." },
  { pattern: /\bplease\b/gi, badTerm: "please", correction: "", rule: "Do not use 'please' in technical documentation." },
  { pattern: /\binput\b(?!\s+(device|method))/gi, badTerm: "input", correction: "enter", rule: "Use 'enter' or 'type' instead of 'input'." },
  { pattern: /\bwill\s+\w+/gi, badTerm: "will [verb]", correction: "(use present tense)", rule: "Avoid future tense." },
  { pattern: /\bright-click on\b/gi, badTerm: "right-click on", correction: "right-click", rule: "Do not use 'on' after 'right-click'." },
  { pattern: /\btap on\b/gi, badTerm: "tap on", correction: "tap", rule: "Do not use 'on' after 'tap'." },
  { pattern: /\bin the event that\b/gi, badTerm: "in the event that", correction: "if", rule: "Use 'if' instead of 'in the event that'." },
  { pattern: /\bdue to the fact that\b/gi, badTerm: "due to the fact that", correction: "because", rule: "Use 'because' instead of 'due to the fact that'." },
  { pattern: /\bat this point in time\b/gi, badTerm: "at this point in time", correction: "now", rule: "Use 'now' instead of 'at this point in time'." },
  { pattern: /\bprior to\b/gi, badTerm: "prior to", correction: "before", rule: "Use 'before' instead of 'prior to'." },
  { pattern: /\bsubsequent to\b/gi, badTerm: "subsequent to", correction: "after", rule: "Use 'after' instead of 'subsequent to'." },
];

const server = new McpServer({
  name: "writing-rules-mcp",
  version: "1.0.0",
});

server.tool(
  "apply_writing_rules",
  "Applies Microsoft Manual of Style writing rules to the input text. Returns ONLY the corrected text.",
  { text: z.string().describe("The text to correct according to writing rules.") },
  async ({ text }) => {
    let correctedText = text;
    for (const rule of WRITING_RULES) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(correctedText)) {
        rule.pattern.lastIndex = 0;
        correctedText = correctedText.replace(rule.pattern, rule.correction);
      }
    }
    correctedText = correctedText.replace(/\s{2,}/g, " ");
    correctedText = correctedText.replace(/\(remove\)/g, "");
    return {
      content: [{ type: "text" as const, text: correctedText }],
    };
  }
);

server.tool(
  "check_writing_violations",
  "Checks text for writing rule violations. Returns a detailed report with original text, corrected text, and the rule broken.",
  { text: z.string().describe("The text to check for writing rule violations.") },
  async ({ text }) => {
    const sentences = splitSentences(text);
    const violations: Array<{
      bad_term: string;
      rule: string;
      original_text: string;
      corrected_text: string;
    }> = [];

    for (const sentence of sentences) {
      for (const rule of WRITING_RULES) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(sentence)) {
          rule.pattern.lastIndex = 0;
          const correctedSentence = sentence.replace(rule.pattern, rule.correction);
          const cleanedCorrection = correctedSentence.replace(/\(remove\)/g, "").replace(/\s{2,}/g, " ");
          violations.push({
            bad_term: rule.badTerm,
            rule: rule.rule,
            original_text: sentence,
            corrected_text: cleanedCorrection,
          });
        }
      }
    }

    for (const sentence of sentences) {
      if (detectPassiveVoice(sentence)) {
        violations.push({
          bad_term: "passive voice",
          rule: "Always use active voice.",
          original_text: sentence,
          corrected_text: `[REWRITE IN ACTIVE VOICE: "${sentence}"]`,
        });
      }
    }

    for (const sentence of sentences) {
      const wordCount = countWords(sentence);
      if (wordCount > 20) {
        violations.push({
          bad_term: `long sentence (${wordCount} words)`,
          rule: "Keep sentences under 20 words for clarity.",
          original_text: sentence,
          corrected_text: "[SPLIT INTO SHORTER SENTENCES]",
        });
      }
    }

    const result = {
      total_violations: violations.length,
      violations: violations,
      is_compliant: violations.length === 0,
      verdict:
        violations.length === 0 ? "FULLY_COMPLIANT" :
        violations.length <= 3 ? "MINOR_ISSUES" : "NEEDS_REVISION",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "get_writing_rules",
  "Returns all writing rules currently being enforced by this MCP server.",
  {},
  async () => {
    const rules = WRITING_RULES.map((rule) => ({
      bad_term: rule.badTerm,
      correction: rule.correction,
      rule: rule.rule,
    }));
    rules.push({ bad_term: "passive voice", correction: "active voice", rule: "Always use active voice." });
    rules.push({ bad_term: "sentences over 20 words", correction: "split into shorter sentences", rule: "Keep sentences under 20 words." });
    return {
      content: [{ type: "text" as const, text: JSON.stringify(rules, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Writing Rules MCP Server is running...");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});