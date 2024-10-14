import { existsSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import path from "path";

const execAsync = promisify(exec);

function decodeUnicode(str: string): string {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
  );
}

export async function downloadVideo(url: string): Promise<string> {
  try {
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
  } catch (error) {
    console.error("Error downloading audio:", error);
    throw error;
  }
}
