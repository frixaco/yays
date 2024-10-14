## Yet Another YouTube Summarizer

A simple CLI app to transcribe YouTube videos using Groq's Distill-Whisper and summarize them using Anthropic's Claude 3.5 Sonnet

## Requirements

- [Bun](https://bun.sh)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)

### Usage

```bash
bun install
bun start
```

Generates two types of files for each processed video:

1. `<video_title>.md`: Contains the full transcription of the video.
2. `summary_<video_title>.md`: Provides a summary of the transcribed video content.

## Example

Example output files included:

1. YouTube shorts, Dr. K and Mizkif

- [summary_Your_Thoughts_Are_Not_You_Mizkif.md](./summary_Your_Thoughts_Are_Not_You_Mizkif.md)
- [Your_Thoughts_Are_Not_You_Mizkif.md](./Your_Thoughts_Are_Not_You_Mizkif.md)

## TODO

- [ ] Play around with different prompt and see which I like better
- [ ] Try different models for transcription and summarization
