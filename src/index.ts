import { downloadVideo } from "./downloader";
import { transcribeVideo } from "./transcriber";
import { summarizeText } from "./summarizer";
import { readFileSync, unlinkSync } from "fs";
import { basename, extname } from "path";

async function main() {
  const videoUrl = Bun.argv[2];
  if (!videoUrl) {
    console.error("Please provide a YouTube video URL as an argument.");
    process.exit(1);
  }

  try {
    // Download video
    const videoPath = await downloadVideo(videoUrl);
    console.log(`Video downloaded: ${videoPath}`);

    // Transcribe video
    const videoTitle = basename(videoPath, extname(videoPath));
    const transcriptionPath = `${videoTitle}.txt`;
    await transcribeVideo(videoPath, transcriptionPath);
    console.log(`Video transcribed: ${transcriptionPath}`);

    // Summarize transcription
    const transcriptionText = readFileSync(transcriptionPath, "utf-8");
    const summaryPath = `summary_${videoTitle}.txt`;
    await summarizeText(transcriptionText, summaryPath);
    console.log(`Summary generated: ${summaryPath}`);

    // Clean up video file
    unlinkSync(videoPath);
    console.log("Video file deleted");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
