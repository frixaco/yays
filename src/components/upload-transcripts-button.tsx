"use client";

import { Button } from "@/components/ui/button";

export function UploadTranscriptsButton() {
  const uploadTranscripts = async () => {
    const response = await fetch("/api/pinecone", {
      method: "POST",
    });
    console.log(response);
  };

  return <Button onClick={uploadTranscripts}>Upload Transcripts</Button>;
}
