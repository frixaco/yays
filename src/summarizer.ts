import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeText(
  text: string,
  outputPath: string
): Promise<void> {
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
}
