"server-only";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Pinecone } from "@pinecone-database/pinecone";
import { updateVectorDatabase } from "./lib/utils";

export const handleVideo = async (formData: FormData) => {
  const videoUrl = formData.get("videoUrl");
  console.log(videoUrl);
};

export const handleTranscriptUpload = async () => {
  const loader = new DirectoryLoader("../transcripts", {
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
};
