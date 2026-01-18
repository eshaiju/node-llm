import { DocumentIngestion } from "@/services/document-ingestion";
import { SAMPLE_HR_POLICIES } from "@/data/sample-policies";

async function seedHRPolicies() {
  console.log("🌱 Seeding HR policy documents...\n");

  // Clear existing data to prevent duplicates or dimension mismatches
  const { deletedCount } = await DocumentIngestion.clear();
  console.log(`🧹 Cleared ${deletedCount} existing chunks.`);

  const policies = [
    { content: SAMPLE_HR_POLICIES.remoteWork, source: "remote-work-policy.pdf" },
    { content: SAMPLE_HR_POLICIES.vacation, source: "pto-policy.pdf" },
    { content: SAMPLE_HR_POLICIES.benefits, source: "benefits-guide.pdf" },
    { content: SAMPLE_HR_POLICIES.workHours, source: "work-hours-policy.pdf" },
    { content: SAMPLE_HR_POLICIES.codeOfConduct, source: "code-of-conduct.pdf" },
  ];

  let totalChunks = 0;

  for (const policy of policies) {
    const result = await DocumentIngestion.ingest(policy.content, {
      source: policy.source,
    });
    console.log(`✅ Ingested ${policy.source}: ${result.chunksCreated} chunks`);
    totalChunks += result.chunksCreated;
  }

  console.log(`\n🎉 Successfully ingested ${totalChunks} total chunks from ${policies.length} documents`);
}

seedHRPolicies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
