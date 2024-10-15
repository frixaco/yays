import { downloadVideo } from "./downloader";
import { transcribeWithGemini, transcribeWithGroq } from "./transcriber";
import { summarizeTranscriptionAndSave } from "./summarizer";
import { readFileSync } from "fs";
import { basename, extname } from "path";

const PLATFORM: "GROQ" | "GEMINI" = "GROQ";

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
