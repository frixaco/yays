import { SearchButton } from "@/components/search-button";
import { UploadTranscriptsButton } from "@/components/upload-transcripts-button";

export default async function Home() {
  return (
    <div className="flex flex-col gap-8">
      <SearchButton />

      <UploadTranscriptsButton />
    </div>
  );
}
