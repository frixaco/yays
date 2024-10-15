import path from "path";
import { writeFileSync, existsSync, createReadStream } from "fs";
import Groq from "groq-sdk";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function transcribeWithGroq(
  videoPath: string,
  outputPath: string
): Promise<void> {
  console.log("Transcribing audio...", videoPath, " to ", outputPath);

  const absoluteVideoPath = path.resolve(videoPath);

  if (!existsSync(absoluteVideoPath)) {
    throw new Error(`File not found: ${absoluteVideoPath}`);
  }

  const transcription = await groq.audio.transcriptions.create({
    file: createReadStream(absoluteVideoPath),
    model: "distil-whisper-large-v3-en", // 13% error rate
    // model: "whisper-large-v3", // 10% error rate
    // model: "whisper-large-v3-turbo	", // 12$ error rate
    response_format: "json",
    language: "en", // Don't forget to change when testing other languages
  });

  console.log("Transcription completed successfully");

  writeFileSync(outputPath, transcription.text);
  console.log("Transcription saved to:", outputPath);
}

export async function transcribeWithGemini(
  videoPath: string,
  outputPath: string
): Promise<void> {
  // const files = (await fileManager.listFiles()).files;
  // for await (const file of files) {
  //   await fileManager.deleteFile(file.name);
  // }
  // console.log(await fileManager.listFiles());
  // return;

  console.log("Transcribing audio...", videoPath, " to ", outputPath);

  const absoluteVideoPath = path.resolve(videoPath);

  if (!existsSync(absoluteVideoPath)) {
    throw new Error(`File not found: ${absoluteVideoPath}`);
  }

  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
  const uploadResult = await fileManager.uploadFile(videoPath, {
    mimeType: "audio/mp3",
    displayName: "Audio sample",
  });
  let file = await fileManager.getFile(uploadResult.file.name);
  while (file.state === FileState.PROCESSING) {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    file = await fileManager.getFile(uploadResult.file.name);
  }
  if (file.state === FileState.FAILED) {
    throw new Error("Audio processing failed.");
  }
  console.log(
    `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
  );

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    "Generate a transcript of the speech.",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  console.log("Transcription completed successfully");

  writeFileSync(outputPath, result.response.text());
  console.log("Transcription saved to:", outputPath);
}
