"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Prompt2PixelLanding from "@/components/prompt2pixel-landing";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/chat");
  };

  return <Prompt2PixelLanding />;
}
