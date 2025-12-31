import { ModerationResponse, ModerationResult } from "../providers/Provider.js";

/**
 * Represents the results of a moderation request.
 * Can contain one or multiple results if multiple inputs were provided.
 */
export class Moderation implements Iterable<ModerationItem> {
  constructor(private readonly response: ModerationResponse) {}

  get id(): string {
    return this.response.id;
  }

  get model(): string {
    return this.response.model;
  }

  /**
   * Returns all results as ModerationItem instances
   */
  get results(): ModerationItem[] {
    return this.response.results.map((r) => new ModerationItem(r));
  }

  /**
   * Returns the number of results
   */
  get length(): number {
    return this.response.results.length;
  }

  /**
   * Returns true if any of the results are flagged
   */
  get flagged(): boolean {
    return this.response.results.some((r) => r.flagged);
  }

  /**
   * Aggregates all flagged categories across all results
   */
  get flaggedCategories(): string[] {
    const all = new Set<string>();
    for (const item of this.results) {
      item.flaggedCategories.forEach((cat) => all.add(cat));
    }
    return Array.from(all);
  }

  /**
   * Returns categories for the first result (most common case)
   */
  get categories(): Record<string, boolean> {
    return this.results[0]?.categories || {};
  }

  /**
   * Returns category scores for the first result
   */
  get categoryScores(): Record<string, number> {
    return this.results[0]?.categoryScores || {};
  }

  // --- Ruby-compatible aliases ---
  get flagged_categories(): string[] { return this.flaggedCategories; }
  get category_scores(): Record<string, number> { return this.categoryScores; }
  isFlagged(): boolean { return this.flagged; }

  /**
   * Makes the Moderation object iterable (yields results)
   */
  *[Symbol.iterator](): Iterator<ModerationItem> {
    for (const item of this.results) {
      yield item;
    }
  }
}

/**
 * Represents a single result within a moderation request
 */
export class ModerationItem {
  constructor(public readonly raw: ModerationResult) {}

  get flagged(): boolean {
    return this.raw.flagged;
  }

  get categories(): Record<string, boolean> {
    return this.raw.categories;
  }

  get categoryScores(): Record<string, number> {
    return this.raw.category_scores;
  }

  get flaggedCategories(): string[] {
    return Object.keys(this.categories).filter((cat) => this.categories[cat]);
  }

  // --- Ruby-compatible aliases ---
  get flagged_categories(): string[] { return this.flaggedCategories; }
  get category_scores(): Record<string, number> { return this.categoryScores; }
}
