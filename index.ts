import { readFileSync, writeFileSync, existsSync, createReadStream } from "fs";
import { basename, extname } from "path";
import path from "path";
import Groq from "groq-sdk";
import { FileState, GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { promisify } from "util";
import { exec } from "child_process";
import Anthropic from "@anthropic-ai/sdk";

const PLATFORM: "GROQ" | "GEMINI" = "GROQ";

// =================== TRANSCRIPTION ===================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function transcribeWithGroq(
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

async function transcribeWithGemini(
  videoPath: string,
  outputPath: string,
  summaryPath: string
): Promise<void> {
  // Uncomment to delete all files
  // const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
  const transcription = await model.generateContent([
    "Generate a transcript of the speech.",
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  console.log("Transcription completed successfully");

  writeFileSync(outputPath, transcription.response.text());
  console.log("Transcription saved to:", outputPath);

  const summary = await model.generateContent([
    `Please provide detailed comprehensive summary for the audio.`,
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      },
    },
  ]);

  console.log("Summary completed successfully");

  writeFileSync(summaryPath, summary.response.text());
  console.log("Summary saved to:", summaryPath);
}

// =================== SUMMARIZATION ===================
async function summarizeTranscriptionAndSave(
  text: string,
  outputPath: string
): Promise<void> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log("Summarizing text...");
  // Split the text into chunks of approximately 100,000 characters
  const chunkSize = 100000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  let fullSummary = "";

  for (const chunk of chunks) {
    console.log("Summarizing chunk...");
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Please provide a concise summary of the following text:\n\n${chunk}`,
        },
      ],
    });

    fullSummary +=
      response.content[0].type === "text"
        ? response.content[0].text + "\n\n"
        : "\n\n";
  }

  console.log("Final summarization...");

  const finalResponse = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Please provide a final, comprehensive summary of the following text, which consists of summaries of larger chunks:\n\n${fullSummary}`,
      },
    ],
  });

  writeFileSync(
    outputPath,
    finalResponse.content[0].type === "text"
      ? finalResponse.content[0].text
      : ""
  );
  console.log(`Summary generated: ${outputPath}`);
}

// =================== AUDIO DOWNLOAD ===================
const execAsync = promisify(exec);

function decodeUnicode(str: string): string {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
  );
}

export async function downloadVideo(url: string): Promise<string> {
  console.log("Getting audio info...");
  const { stdout: infoOutput } = await execAsync(`yt-dlp -j "${url}"`);
  const audioInfo = JSON.parse(infoOutput);

  const decodedTitle = decodeUnicode(audioInfo.title); // Allow non-latin characters
  const audioTitle = decodedTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "") // Remove characters invalid for filenames
    .trim()
    .replace(/\s+/g, "_");
  console.log(`Audio title: ${audioTitle}`);
  const outputTemplate = `${audioTitle}.%(ext)s`;

  const expectedFilePath = path.resolve(`${audioTitle}.mp3`);

  if (existsSync(expectedFilePath)) {
    console.log(`Audio file already exists: ${expectedFilePath}`);
    return expectedFilePath;
  }

  console.log("Downloading audio...");
  const { stdout: downloadOutput } = await execAsync(
    `yt-dlp -f "bestaudio" -x --audio-format mp3 --audio-quality 0 -o "${outputTemplate}" "${url}"`
  );
  console.log(downloadOutput);

  if (!existsSync(expectedFilePath)) {
    throw new Error(`Downloaded file not found: ${expectedFilePath}`);
  }

  console.log(`Audio downloaded: ${expectedFilePath}`);
  return expectedFilePath;
}

// =================== MAIN ===================
async function main() {
  const videoUrl = Bun.argv[2];
  if (!videoUrl) {
    console.error("Please provide a YouTube video URL as an argument.");
    process.exit(1);
  }

  const videoPath = await downloadVideo(videoUrl);
  const videoTitle = basename(videoPath, extname(videoPath));
  const transcriptionPath = `${videoTitle}.md`;
  const summaryPath = `summary_${videoTitle}.md`;

  if (PLATFORM === "GROQ") {
    await transcribeWithGroq(videoPath, transcriptionPath);
    const transcriptionText = readFileSync(transcriptionPath, "utf-8");
    await summarizeTranscriptionAndSave(transcriptionText, summaryPath);
  }

  if (PLATFORM === "GEMINI") {
    await transcribeWithGemini(videoPath, transcriptionPath, summaryPath);
  }

  // unlinkSync(videoPath);
  console.log("Video file deleted");
}

main();