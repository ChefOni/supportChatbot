import { Queue, Worker, Job } from "bullmq";
import { redisClient } from "@/lib/redis";
import { processDocument } from "@/services/ingestionService";

// BullMQ queue for document ingestion
export const ingestionQueue = new Queue("document-ingestion", {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Worker to process ingestion jobs
export const ingestionWorker = new Worker(
  "document-ingestion",
  async (job: Job<{
    tenantId: string;
    documentId: string;
    filePath: string;
    mimeType: string;
  }>) => {
    const { tenantId, documentId, filePath, mimeType } = job.data;

    console.log(`Processing document ${documentId} for tenant ${tenantId}`);

    try {
      await processDocument(tenantId, documentId, filePath, mimeType);
      console.log(`Successfully processed document ${documentId}`);
    } catch (error) {
      console.error(`Failed to process document ${documentId}:`, error);
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 2, // Process 2 documents at a time
  }
);

ingestionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

// Helper to add ingestion job
export async function addIngestionJob(data: {
  tenantId: string;
  documentId: string;
  filePath: string;
  mimeType: string;
}): Promise<void> {
  await ingestionQueue.add("process-document", data);
}
