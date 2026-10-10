import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function detectPassiveVoice(sentences: string[]): string[] {
  const passivePatterns = [
    /\b(is|are|was|were|been|being)\s+\w+(?:ed|en|wn|ne|lt|pt)\b/gi,
    /\b(is|are|was|were|been|being)\s+being\s+\w+(?:ed|en)\b/gi,
  ];
  const passiveSentences: string[] = [];
  for (const sentence of sentences) {
    for (const pattern of passivePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(sentence)) {
        passiveSentences.push(sentence);
        break;
      }
    }
  }
  return passiveSentences;
}

function fleschKincaidGrade(text: string): number {
  const sentences = splitSentences(text);
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  if (sentences.length === 0 || words.length === 0) return 0;
  return (
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59
  );
}

const server = new McpServer({
  name: "quality-metric-mcp",
  version: "1.0.0",
});

server.tool(
  "analyze_readability",
  "Analyzes text readability. Returns sentence count, average sentence length, passive voice instances, and Flesch-Kincaid grade level.",
  { text: z.string().describe("The text content to analyze for readability.") },
  async ({ text }) => {
    const sentences = splitSentences(text);
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    const totalWords = words.length;
    const avgSentenceLength = sentences.length > 0 ? totalWords / sentences.length : 0;
    const passiveSentences = detectPassiveVoice(sentences);
    const gradeLevel = fleschKincaidGrade(text);
    const longSentences = sentences.filter((s) => countWords(s) > 25);

    const result = {
      total_sentences: sentences.length,
      total_words: totalWords,
      average_sentence_length: Math.round(avgSentenceLength * 10) / 10,
      passive_voice_count: passiveSentences.length,
      passive_voice_examples: passiveSentences.slice(0, 5),
      long_sentences_count: longSentences.length,
      long_sentence_examples: longSentences.slice(0, 3),
      flesch_kincaid_grade_level: Math.round(gradeLevel * 10) / 10,
      readability_verdict:
        avgSentenceLength <= 20 && passiveSentences.length === 0
          ? "GOOD"
          : avgSentenceLength <= 25
            ? "ACCEPTABLE"
            : "NEEDS_IMPROVEMENT",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "check_style_violations",
  "Checks text for style violations. Returns violations with the original text, corrected text, and the specific rule broken.",
  { text: z.string().describe("The text content to check for style compliance.") },
  async ({ text }) => {
    const sentences = splitSentences(text);
    const violations: Array<{
      bad_term: string;
      rule: string;
      original_text: string;
      corrected_text: string;
    }> = [];

    const STYLE_RULES = [
      { pattern: /\bclick on\b/gi, badTerm: "click on", correction: "click", rule: "Do not use 'on' after 'click'." },
      { pattern: /\bselect\b/gi, badTerm: "select", correction: "click", rule: "Use 'click' for mouse actions, not 'select'." },
      { pattern: /\butilize\b/gi, badTerm: "utilize", correction: "use", rule: "Use 'use' instead of 'utilize'." },
      { pattern: /\bin order to\b/gi, badTerm: "in order to", correction: "to", rule: "Use 'to' instead of 'in order to'." },
      { pattern: /\bplease\b/gi, badTerm: "please", correction: "(remove)", rule: "Do not use 'please' in technical documentation." },
      { pattern: /\bwill\s+\w+/gi, badTerm: "will [verb]", correction: "(use present tense)", rule: "Avoid future tense." },
    ];

    for (const sentence of sentences) {
      for (const rule of STYLE_RULES) {
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(sentence)) {
          rule.pattern.lastIndex = 0;
          const correctedSentence = sentence.replace(rule.pattern, rule.correction);
          violations.push({
            bad_term: rule.badTerm,
            rule: rule.rule,
            original_text: sentence,
            corrected_text: correctedSentence,
          });
        }
      }
    }

    const passiveSentences = detectPassiveVoice(sentences);
    for (const passiveSentence of passiveSentences) {
      violations.push({
        bad_term: "passive voice",
        rule: "Always use active voice.",
        original_text: passiveSentence,
        corrected_text: `[REWRITE IN ACTIVE VOICE: "${passiveSentence}"]`,
      });
    }

    const result = {
      total_violations: violations.length,
      violations: violations,
      style_verdict:
        violations.length === 0
          ? "FULLY_COMPLIANT"
          : violations.length <= 3
            ? "MINOR_ISSUES"
            : "NEEDS_REVISION",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "evaluate_structure",
  "Evaluates the structural quality of a Markdown document.",
  {
    markdown: z.string().describe("The Markdown content to evaluate."),
    expected_sections: z.array(z.string()).optional().describe("Optional list of expected section names."),
  },
  async ({ markdown, expected_sections }) => {
    const issues: string[] = [];
    const strengths: string[] = [];

    const h1Matches = markdown.match(/^# .+$/gm);
    if (!h1Matches || h1Matches.length === 0) {
      issues.push("Missing H1 title.");
    } else if (h1Matches.length > 1) {
      issues.push(`Multiple H1 titles found (${h1Matches.length}).`);
    } else {
      strengths.push("Document has a clear H1 title.");
    }

    const headings = markdown.match(/^#{1,6}\s+.+$/gm) || [];
    const headingLevels = headings.map((h) => h.match(/^#+/)![0].length);
    let hierarchyOk = true;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        issues.push(`Heading level skipped: H${headingLevels[i - 1]} to H${headingLevels[i]}.`);
        hierarchyOk = false;
      }
    }
    if (hierarchyOk && headings.length > 1) {
      strengths.push("Heading hierarchy is correct.");
    }

    const bulletLists = markdown.match(/^[\-\*]\s+.+$/gm) || [];
    const numberedLists = markdown.match(/^\d+\.\s+.+$/gm) || [];
    if (bulletLists.length === 0 && numberedLists.length === 0) {
      issues.push("No lists found.");
    } else {
      strengths.push(`Document uses lists (${bulletLists.length} bullets, ${numberedLists.length} numbered).`);
    }

    const missingSections: string[] = [];
    if (expected_sections && expected_sections.length > 0) {
      for (const section of expected_sections) {
        const sectionRegex = new RegExp(`^#{1,6}\\s+.*${section}.*$`, "gmi");
        if (!sectionRegex.test(markdown)) {
          missingSections.push(section);
        }
      }
      if (missingSections.length > 0) {
        issues.push(`Missing sections: ${missingSections.join(", ")}`);
      } else {
        strengths.push("All expected sections present.");
      }
    }

    const wordCount = countWords(markdown);
    if (wordCount < 50) {
      issues.push(`Document is very short (${wordCount} words).`);
    } else {
      strengths.push(`Document has substantial content (${wordCount} words).`);
    }

    const structureScore = Math.max(0, 100 - issues.length * 15 + strengths.length * 5);

    const result = {
      total_headings: headings.length,
      word_count: wordCount,
      strengths: strengths,
      issues: issues,
      missing_sections: missingSections,
      structure_score: Math.min(100, structureScore),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "calculate_quality_score",
  "Calculates a final quality score out of 100.",
  {
    readability_verdict: z.enum(["GOOD", "ACCEPTABLE", "NEEDS_IMPROVEMENT"]),
    avg_sentence_length: z.number(),
    passive_voice_count: z.number(),
    style_total_violations: z.number(),
    structure_score: z.number(),
    completeness_score: z.number().min(0).max(100),
    document_name: z.string(),
  },
  async ({
    readability_verdict,
    avg_sentence_length,
    passive_voice_count,
    style_total_violations,
    structure_score,
    completeness_score,
    document_name,
  }) => {
    let readabilityScore = 30;
    if (readability_verdict === "NEEDS_IMPROVEMENT") readabilityScore = 10;
    else if (readability_verdict === "ACCEPTABLE") readabilityScore = 20;
    if (avg_sentence_length > 25) readabilityScore -= 5;
    readabilityScore -= Math.min(passive_voice_count * 3, 10);
    readabilityScore = Math.max(0, readabilityScore);

    let styleScore = 40;
    styleScore -= style_total_violations * 5;
    styleScore = Math.max(0, styleScore);

    const scaledStructure = Math.round((structure_score / 100) * 15);
    const scaledCompleteness = Math.round((completeness_score / 100) * 15);

    const finalScore = readabilityScore + styleScore + scaledStructure + scaledCompleteness;

    const result = {
      document_name: document_name,
      final_score: Math.min(100, finalScore),
      breakdown: {
        readability: { score: readabilityScore, max: 30 },
        style_compliance: { score: styleScore, max: 40 },
        document_structure: { score: scaledStructure, max: 15 },
        completeness: { score: scaledCompleteness, max: 15 },
      },
      grade:
        finalScore >= 90 ? "A (Excellent)" :
        finalScore >= 75 ? "B (Good)" :
        finalScore >= 60 ? "C (Acceptable)" :
        finalScore >= 40 ? "D (Needs Work)" : "F (Poor)",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Quality Metric MCP Server is running...");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});