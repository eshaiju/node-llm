import { prisma } from "@/lib/db";
import { llm } from "@/lib/node-llm";
import crypto from "crypto";

interface IngestionOptions {
  source?: string;
  chunkSize?: number;
  overlapSize?: number;
}

export class DocumentIngestion {
  static async ingest(
    text: string,
    options: IngestionOptions = {}
  ): Promise<{ chunksCreated: number }> {
    const { source = "unknown", chunkSize = 500, overlapSize = 50 } = options;

    const chunks = this.chunkText(text, chunkSize, overlapSize);
    
    const embeddingProvider = process.env.NODELLM_EMBEDDING_PROVIDER;
    const embeddingModel = process.env.NODELLM_EMBEDDING_MODEL;
    
    const embedder = embeddingProvider ? llm.withProvider(embeddingProvider as any) : llm;
    const embeddings = await embedder.embed(chunks, embeddingModel ? { model: embeddingModel } : undefined);

    // Use raw SQL for vector insertion
    await Promise.all(
      chunks.map(async (content, index) => {
        const embedding = JSON.stringify(embeddings.vectors[index]);
        const metadata = JSON.stringify({
          source,
          chunkIndex: index,
          totalChunks: chunks.length,
        });
        const id = crypto.randomUUID();

        await prisma.$executeRaw`
          INSERT INTO "DocumentChunk" ("id", "content", "embedding", "metadata", "createdAt")
          VALUES (${id}, ${content}, ${embedding}::vector, ${metadata}, NOW())
        `;
      })
    );

    return { chunksCreated: chunks.length };
  }

  private static chunkText(
    text: string,
    chunkSize: number,
    overlapSize: number
  ): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        const words = currentChunk.split(" ");
        const overlapWords = words.slice(-Math.ceil(overlapSize / 5));
        currentChunk = overlapWords.join(" ") + " " + sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  static async clear(): Promise<{ deletedCount: number }> {
    const result = await (prisma as any).documentChunk.deleteMany({});
    return { deletedCount: result.count };
  }
}
