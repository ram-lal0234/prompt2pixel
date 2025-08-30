'use client';

import { usePathname } from 'next/navigation';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";

export function ConditionalHeader() {
  const pathname = usePathname();
  const isChatRoute = pathname === '/chat';

  // Don't show header on chat route
  if (isChatRoute) {
    return null;
  }

  return (
    <header className="border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/Prompt2Pixel_logo.png"
            alt="Prompt2Pixel Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Prompt2Pixel
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-sm hover:shadow-md">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
