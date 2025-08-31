"use client";

import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";

export function ChatHeader() {
  return (
    <header className="border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/Prompt2Pixel_logo.png"
            alt="Prompt2Pixel Logo"
            width={100}
            height={100}
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Prompt2Pixel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
