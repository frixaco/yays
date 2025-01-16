import { UploadTranscriptsButton } from "@/components/upload-transcripts-button";

export default async function Home() {
  return (
    <div className="bg-red-500 text-white">
      <h1>Vector Database</h1>

      <UploadTranscriptsButton />
    </div>
  );
}
