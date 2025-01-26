"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Send,
  Youtube,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Clock,
  User,
  CreditCard,
  BarChart,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoProcessed, setVideoProcessed] = useState(false);
  const [isCustomPromptOpen, setIsCustomPromptOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentVideos, setCurrentVideos] = useState<string[]>([]);
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);

  const toggleLeftDrawer = () => setIsLeftDrawerOpen(!isLeftDrawerOpen);
  const toggleRightDrawer = () => setIsRightDrawerOpen(!isRightDrawerOpen);

  const handleStartProcessing = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setVideoProcessed(true);
      setCurrentVideos((prev) => [
        ...prev,
        "How to Build a Next.js App with AI",
      ]);
    }, 3000);
  };

  const handleCustomPromptSubmit = () => {
    // Here you would handle the custom prompt submission
    console.log("Custom prompt submitted:", customPrompt);
    setIsCustomPromptOpen(false);
  };

  const handleTranscriptClick = (timestamp: string) => {
    setActiveTranscript(timestamp);
    setIsLeftDrawerOpen(true);
    setTimeout(() => {
      if (transcriptRef.current) {
        const element = transcriptRef.current.querySelector(
          `[data-timestamp="${timestamp}"]`,
        );
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  };

  return (
    <div className="flex min-h-screen bg-black font-mono text-white">
      {/* Left Drawer */}
      <motion.aside
        initial={{ width: 0 }}
        animate={{ width: isLeftDrawerOpen ? "400px" : "0px" }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-r border-zinc-800 bg-[#111111]"
      >
        <ScrollArea className="h-screen p-4">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Paste a YouTube URL"
              className="border-zinc-800 bg-black text-white"
            />
            <Button
              className="bg-orange-600 text-white hover:bg-orange-700"
              onClick={handleStartProcessing}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Start Analysis"
              )}
            </Button>
            {videoProcessed && (
              <div className="rounded-sm border border-zinc-700 bg-[#1a1a1a] p-4 shadow-lg">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center bg-black">
                    <Youtube className="h-6 w-6 text-zinc-800" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">
                      How to Build a Next.js App with AI
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Vercel • Duration: 15:42
                    </p>
                  </div>
                </div>
                <p className="mb-3 text-sm text-zinc-300">
                  This video covers the process of building a Next.js
                  application with AI integration. Key topics include setting up
                  a Next.js project, implementing AI features, and deploying the
                  app.
                </p>
                <button
                  className="flex items-center text-xs text-orange-500 hover:text-orange-400"
                  onClick={() => setIsCustomPromptOpen(true)}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Customize summary prompt
                </button>
              </div>
            )}
            {isCustomPromptOpen && (
              <div className="rounded-sm border border-zinc-700 bg-[#1a1a1a] p-4 shadow-lg">
                <h4 className="mb-2 text-sm font-medium">
                  Custom Summary Prompt
                </h4>
                <Textarea
                  placeholder="Enter your custom prompt for summarization..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="mb-2 border-zinc-800 bg-black text-white"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomPromptOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCustomPromptSubmit}>
                    Apply
                  </Button>
                </div>
              </div>
            )}
            <div className="rounded-sm border border-zinc-700 bg-[#1a1a1a] p-4 shadow-lg">
              <h4 className="mb-2 text-sm font-medium">Transcript</h4>
              <div ref={transcriptRef} className="space-y-2 text-xs">
                <p
                  data-timestamp="00:00"
                  className={
                    activeTranscript === "00:00" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [00:00] Welcome to this tutorial on building a Next.js app
                  with AI integration.
                </p>
                <p
                  data-timestamp="00:30"
                  className={
                    activeTranscript === "00:30" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [00:30] First, we'll set up our Next.js project using the
                  latest version.
                </p>
                <p
                  data-timestamp="02:30"
                  className={
                    activeTranscript === "02:30" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [02:30] Now, let's install the necessary AI libraries for our
                  project.
                </p>
                <p
                  data-timestamp="04:15"
                  className={
                    activeTranscript === "04:15" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [04:15] We'll create an API route for AI integration in our
                  Next.js app.
                </p>
                <p
                  data-timestamp="07:20"
                  className={
                    activeTranscript === "07:20" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [07:20] Let's implement the frontend UI for our AI-powered
                  features.
                </p>
                <p
                  data-timestamp="10:05"
                  className={
                    activeTranscript === "10:05" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [10:05] Now we'll connect our frontend to the AI backend we
                  just created.
                </p>
                <p
                  data-timestamp="12:30"
                  className={
                    activeTranscript === "12:30" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [12:30] Time to test our Next.js app with AI integration.
                </p>
                <p
                  data-timestamp="14:00"
                  className={
                    activeTranscript === "14:00" ? "bg-orange-600/20 p-1" : ""
                  }
                >
                  [14:00] Finally, let's deploy our AI-powered Next.js
                  application.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.aside>

      {/* Main Content */}
      <main className="flex flex-grow flex-col">
        <div className="flex items-center justify-between border-b border-zinc-800 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLeftDrawer}
            className="text-zinc-400 hover:text-white"
          >
            {isLeftDrawerOpen ? (
              <ChevronLeft className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )}
            {isLeftDrawerOpen ? "Close" : "Open"} Sidebar
          </Button>
          <div className="text-sm text-zinc-400">
            {currentVideos.length === 1
              ? currentVideos[0]
              : `${currentVideos.length} videos in context`}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRightDrawer}
            className="text-zinc-400 hover:text-white"
          >
            {isRightDrawerOpen ? (
              <ChevronRight className="mr-2 h-4 w-4" />
            ) : (
              <ChevronLeft className="mr-2 h-4 w-4" />
            )}
            {isRightDrawerOpen ? "Close" : "Open"} Profile
          </Button>
        </div>
        <ScrollArea className="flex-grow p-4">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="max-w-[80%] border border-zinc-800 bg-[#111111] p-4">
              <p className="mb-2 text-xs text-zinc-400">AI Assistant</p>
              <p className="mb-2 text-sm">
                Hello! I've analyzed the video "How to Build a Next.js App with
                AI". What would you like to know about it?
              </p>
            </div>
            <div className="ml-auto max-w-[80%] border border-zinc-800 bg-[#111111] p-4">
              <p className="mb-2 text-xs text-zinc-400">You</p>
              <p className="text-sm">
                What are the main steps to build a Next.js app with AI?
              </p>
            </div>
            <div className="max-w-[80%] border border-zinc-800 bg-[#111111] p-4">
              <p className="mb-2 text-xs text-zinc-400">AI Assistant</p>
              <p className="mb-2 text-sm">
                Based on the video content, here are the main steps to build a
                Next.js app with AI:
              </p>
              <ol className="mb-2 list-inside list-decimal text-sm">
                <li>
                  Set up a new Next.js project
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("00:30")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    00:30
                  </button>
                </li>
                <li>
                  Install necessary AI libraries
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("02:30")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    02:30
                  </button>
                </li>
                <li>
                  Create an API route for AI integration
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("04:15")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    04:15
                  </button>
                </li>
                <li>
                  Implement the frontend UI
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("07:20")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    07:20
                  </button>
                </li>
                <li>
                  Connect the frontend to the AI backend
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("10:05")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    10:05
                  </button>
                </li>
                <li>
                  Test and deploy the application
                  <button
                    className="ml-2 text-xs text-orange-500 hover:text-orange-400"
                    onClick={() => handleTranscriptClick("12:30")}
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    12:30
                  </button>
                </li>
              </ol>
            </div>
          </div>
        </ScrollArea>
        <div className="border-t border-zinc-800 p-4">
          <div className="mx-auto flex max-w-2xl gap-2">
            <Input
              placeholder="Ask about the video content..."
              className="border-zinc-800 bg-black text-sm text-white"
            />
            <Button size="icon" className="bg-orange-600 hover:bg-orange-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Right Drawer */}
      <motion.aside
        initial={{ width: 0 }}
        animate={{ width: isRightDrawerOpen ? "300px" : "0px" }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-l border-zinc-800 bg-[#111111]"
      >
        <ScrollArea className="h-screen">
          <div className="space-y-4 p-4">
            <div className="mb-6 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                <User className="h-6 w-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-zinc-400">john.doe@example.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Available Credits</span>
                <span className="text-sm font-medium">500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">Next Renewal</span>
                <span className="text-sm font-medium">05/15/2023</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="flex items-center text-sm font-medium">
                <BarChart className="mr-2 h-4 w-4" />
                Usage Statistics
              </h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Videos Analyzed</span>
                  <span className="text-sm">15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Total Chat Messages
                  </span>
                  <span className="text-sm">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">AI Tokens Used</span>
                  <span className="text-sm">25,430</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </motion.aside>
    </div>
  );
}
