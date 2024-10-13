import { existsSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import path from "path";

const execAsync = promisify(exec);

export async function downloadVideo(url: string): Promise<string> {
  try {
    console.log("Getting audio info...");
    const { stdout: infoOutput } = await execAsync(`yt-dlp -j "${url}"`);
    const audioInfo = JSON.parse(infoOutput);

    const audioTitle = audioInfo.title
      .replace(/[^\w\s-]/gi, "")
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
  } catch (error) {
    console.error("Error downloading audio:", error);
    throw error;
  }
}
