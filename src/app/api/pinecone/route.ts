import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  Pinecone,
  PineconeRecord,
  RecordId,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
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

  for (const doc of docs) {
    await processDocument(client, indexName, doc, extractor);
  }
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

  return NextResponse.json({ message: "success" });
}

async function processDocument(
  client: Pinecone,
  indexName: string,
  doc: Document,
  extractor: FeatureExtractionPipeline,
) {
  console.log(doc);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", ".", "?", "!", " ", ""],
  });
  const chunks = await splitter.splitText(doc.pageContent);
  const fileName = extractFileName(doc.metadata.source);

  console.log(chunks.length);

  const output = await extractor(
    chunks.map((chunk) => chunk.replace(/\n/g, " ")),
    {
      pooling: "cls",
    },
  );
  console.log(output);

  const embeddings = output.tolist();

  let vectors: PineconeRecord<RecordMetadata>[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const id = `${fileName}-${i}`;
    const vector = {
      id,
      values: embeddings[i],
      metadata: {
        source: chunks[i],
      },
    };
    vectors.push(vector);
  }

  const index = client.index(indexName);
  await index.upsert(vectors);
}

function extractFileName(
  filePath: string,
  options = {
    removeExtension: false,
    removeSquareBrackets: false,
  },
) {
  // Get the last part after slashes (handles both forward and backward slashes)
  const fileName = filePath.split(/[\\/]/).pop();

  if (!fileName) return "";

  let result = fileName;

  // Remove file extension if specified
  if (options.removeExtension) {
    result = result.replace(/\.[^/.]+$/, "");
  }

  // Remove content within square brackets if specified
  if (options.removeSquareBrackets) {
    result = result.replace(/\s*\[.*?\]\s*/g, " ").trim();
  }

  return result;
}
