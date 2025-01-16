import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@huggingface/transformers";
import { Document } from "langchain/document";
import { NextResponse, NextRequest } from "next/server";

async function updateVectorDatabase(
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

export async function POST(req: NextRequest, res: NextResponse) {
  const loader = new DirectoryLoader("src/app/api/pinecone/transcripts", {
    ".txt": (path) => new TextLoader(path),
  });

  const docs = await loader.load();

  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  await updateVectorDatabase(
    client,
    "transcripts",
    docs,
    (filename, totalChunks, chunksUpserted, isComplete) => {
      if (isComplete) {
        console.log(`${filename} uploaded`);
      }
    },
  );
}
