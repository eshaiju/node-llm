import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { DocumentIngestion } from "@/services/document-ingestion";
import { DocumentSearch } from "@/services/document-search";
import { prisma } from "@/lib/db";
import * as nodeLLM from "@/lib/node-llm";

vi.mock("@/lib/node-llm", () => ({
  llm: {
    embed: vi.fn(),
  },
}));

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    documentChunk: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn(),
    },
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

describe("RAG Services", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("DocumentIngestion", () => {
    it("should chunk and store text with embeddings using executeRaw", async () => {
      const mockEmbeddings = {
        vectors: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
        ],
      };

      vi.mocked(nodeLLM.llm.embed).mockResolvedValue(mockEmbeddings as any);

      const text = "This is sentence one. This is sentence two.";
      const result = await DocumentIngestion.ingest(text, {
        source: "test.txt",
        chunkSize: 20,
      });

      expect(result.chunksCreated).toBe(2);
      
      // Verify raw SQL execution
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
      expect(prisma.$executeRaw).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('INSERT INTO "DocumentChunk"')]),
        expect.anything(), // ID
        expect.stringContaining("sentence"),
        expect.anything(), // Vector
        expect.stringContaining('source":"test.txt"')
      );
    });
  });

  describe("DocumentSearch", () => {
    it("should return most relevant chunks via vector query", async () => {
      // Mock embedding
      vi.mocked(nodeLLM.llm.embed).mockResolvedValue({
        vectors: [[0.95, 0.05, 0.05]],
      } as any);

      // Mock SQL Result
      const mockRows = [
        {
          content: "Remote work is allowed.",
          score: 0.95,
          metadata: JSON.stringify({ source: "handbook.pdf" }),
        },
      ];
      vi.mocked(prisma.$queryRaw).mockResolvedValue(mockRows as any);

      const results = await DocumentSearch.search("remote work", 1);

      expect(results.length).toBe(1);
      expect(results[0].content).toBe("Remote work is allowed.");
      expect(results[0].score).toBe(0.95);
      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining("ORDER BY embedding <=>")]),
        expect.anything(), // queryVector
        expect.anything(), // queryVector
        1 // topK
      );
    });

    it("should return empty array when no results found", async () => {
      vi.mocked(nodeLLM.llm.embed).mockResolvedValue({
        vectors: [[0.1, 0.1, 0.1]],
      } as any);

      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const results = await DocumentSearch.search("anything");
      expect(results).toEqual([]);
    });
  });
});
