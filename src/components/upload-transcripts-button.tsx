"use client";

import { Button } from "@/components/ui/button";
import { handleTranscriptUpload } from "@/actions";

export function UploadTranscriptsButton() {
  return (
    <Button onClick={() => handleTranscriptUpload()}>Upload Transcripts</Button>
  );
}
