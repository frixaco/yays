import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { pipeline } from "@huggingface/transformers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function updateVectorDatabase(
  client: Pinecone,
  indexName: string,
  // namespace: string,
  docs: Document[],
  progressCallback: (
    filename: string,
    totalChunks: number,
    chunksUpserted: number,
    isComplete: boolean,
  ) => void,
) {
  const modelName = "mixedbread-ai/mxbai-embed-large-v1";
  const extractor = await pipeline("feature-extraction", modelName, {
    dtype: "fp32",
  });
  console.log(extractor);
}
