import { YtDlp } from "@yemreak/yt-dlp";

const ytDlp = new YtDlp({ workdir: "./tmp" });

export async function downloadVideo(url: string): Promise<string> {
  try {
    await ytDlp.downloadLatestReleaseIfNotExists();

    const videoUrls = await ytDlp.downloadAudio({
      url,
      format: "ba", // best audio
      outputPath: "./tmp",
    });

    // The output should contain the filename of the downloaded audio
    const filename = videoUrls[0].match(
      /\[ffmpeg\] Destination: (.+\.mp3)/
    )?.[1];

    if (!filename) {
      throw new Error("Could not extract filename from yt-dlp output");
    }

    // const subtitleText = await ytDlp.downloadSubtitleText({
    //   info: mediaInfo[0],
    //   lang: "en",
    // });

    return filename;
  } catch (error) {
    console.error("Error downloading video:", error);
    throw error;
  }
}
