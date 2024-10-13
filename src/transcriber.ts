import { writeFileSync } from "fs";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/v1/audio/transcriptions";

export async function transcribeVideo(
  videoPath: string,
  outputPath: string
): Promise<void> {
  const file = Bun.file(videoPath);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "distil-whisper");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.statusText}`);
  }

  const result = await response.json();
  writeFileSync(outputPath, result.text);
}
