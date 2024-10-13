import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeText(
  text: string,
  outputPath: string
): Promise<void> {
  // Split the text into chunks of approximately 100,000 characters
  const chunkSize = 100000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  let fullSummary = "";

  for (const chunk of chunks) {
    const response = await anthropic.completions.create({
      model: "claude-2",
      max_tokens_to_sample: 1000,
      prompt: `Human: Please provide a concise summary of the following text:\n\n${chunk}\n\nAssistant: Here's a concise summary of the text:`,
    });

    fullSummary += response.completion + "\n\n";
  }

  // Final summarization of all chunk summaries
  const finalResponse = await anthropic.completions.create({
    model: "claude-2",
    max_tokens_to_sample: 2000,
    prompt: `Human: Please provide a final, comprehensive summary of the following text, which consists of summaries of larger chunks:\n\n${fullSummary}\n\nAssistant: Here's a comprehensive summary of the entire text:`,
  });

  writeFileSync(outputPath, finalResponse.completion);
}
