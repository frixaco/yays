import { SearchButton } from "@/components/search-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UploadTranscriptsButton } from "@/components/upload-transcripts-button";

export default async function Home() {
  return (
    <div className="">
      <ThemeToggle />
      <SearchButton />

      <UploadTranscriptsButton />
    </div>
  );
}
