/**
 * Boring, standard JSON extraction logic.
 * Avoids cleverness in favor of predictable industry-standard patterns.
 */
export function extractJson(text: string): string {
  const cleaned = text.trim();

  // 1. Fast path: The string is already just JSON
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue extraction
  }

  // 2. Handle Markdown blocks (the most common LLM artifact)
  const markdownMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch?.[1]) {
    const candidate = markdownMatch[1].trim();
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Invalid JSON inside backticks, fall through
    }
  }

  // 3. Last resort: Find the first '{' and last '}'
  // This handles conversational filler like "Here is your data: { ... }"
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Not valid JSON
    }
  }

  // 4. Return as-is and let the final JSON.parse() fail loudly
  return cleaned;
}
