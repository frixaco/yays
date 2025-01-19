import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse, NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

export async function GET(req: NextRequest, res: NextResponse) {
  const query = req.nextUrl.searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const modelName = "mixedbread-ai/mxbai-embed-large-v1";
  const extractor = await pipeline("feature-extraction", modelName, {
    dtype: "fp32",
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", ".", "?", "!", " ", ""],
  });
  const chunks = await splitter.splitText(query);

  const output = await extractor(
    chunks.map((chunk) => chunk.replace(/\n/g, " ")),
    {
      pooling: "cls",
    },
  );

  const embeddings = output.tolist();

  const index = client.index("transcripts");
  const records = await index.query({
    topK: 10,
    vector: embeddings,
  });

  const vectors = await index.fetch(records.matches.map((m) => m.id));

  const context = Object.entries(vectors.records).map(([id, record]) => {
    return `Source: ${record.metadata?.source}\n\nVideo title: ${record.id}\n\n`;
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a helpful AI assistant. Your task is to answer questions based on video transcript excerpts.

Relevant transcript excerpts:
${context.join("\n\n")}

Human Question: ${query}

Instructions:
1. Analyze the transcript excerpts above
2. Provide a clear, direct answer to the question in your own words
3. Do NOT simply repeat transcript lines
4. If you can't answer the question from the given context, say "I don't have enough information to answer this question"
5. Base your answer ONLY on the provided transcript excerpts
6. Keep your answer concise and focused

Please provide your answer now:`;

  const transcription = await model.generateContent([prompt]);

  return NextResponse.json(transcription.response.text());
}
