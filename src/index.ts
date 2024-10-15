import { downloadVideo } from "./downloader";
import { transcribeWithGemini, transcribeWithGroq } from "./transcriber";
import { summarizeTranscriptionAndSave } from "./summarizer";
import { readFileSync } from "fs";
import { basename, extname } from "path";

async function main() {
  const videoUrl = Bun.argv[2];
  if (!videoUrl) {
    console.error("Please provide a YouTube video URL as an argument.");
    process.exit(1);
  }

  const videoPath = await downloadVideo(videoUrl);

  const videoTitle = basename(videoPath, extname(videoPath));
  const transcriptionPath = `${videoTitle}.md`;
  await transcribeWithGroq(videoPath, transcriptionPath);
  // await transcribeWithGemini(videoPath, transcriptionPath);

  const transcriptionText = readFileSync(transcriptionPath, "utf-8");
  const summaryPath = `summary_${videoTitle}.md`;
  await summarizeTranscriptionAndSave(transcriptionText, summaryPath);

  // unlinkSync(videoPath);
  console.log("Video file deleted");
}

main();
