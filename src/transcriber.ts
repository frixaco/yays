import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function transcribeVideo(
  videoPath: string,
  outputPath: string
): Promise<void> {
  console.log("Transcribing video...", videoPath, " to ", outputPath);

  const absoluteVideoPath = path.resolve(videoPath);

  if (!fs.existsSync(absoluteVideoPath)) {
    throw new Error(`File not found: ${absoluteVideoPath}`);
  }

  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(absoluteVideoPath),
    // model: "distil-whisper-large-v3-en",
    model: "whisper-large-v3-turbo",
    response_format: "json",
    language: "ru",
  });

  console.log("Transcription completed successfully");

  fs.writeFileSync(outputPath, transcription.text);
  console.log("Transcription saved to:", outputPath);
}
