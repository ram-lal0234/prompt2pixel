import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

// Initialize APIs
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Utility function to rewrite query using OpenAI
async function rewriteQueryWithOpenAI(userQuery: string): Promise<string> {
  try {
    console.log("Rewriting query with OpenAI:", userQuery);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at understanding and rewriting thumbnail creation requests. 

Your task is to take a user's thumbnail request and rewrite it into a clear, professional prompt for AI image generation.

Focus on extracting:
- Main subject/character
- Background/setting
- Text to include
- Style/mood
- Any specific requirements

Return only the rewritten prompt, nothing else. Make it concise but comprehensive.`,
        },
        {
          role: "user",
          content: `Please rewrite this thumbnail request into a professional prompt: "${userQuery}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const rewrittenQuery = completion.choices[0]?.message?.content?.trim();
    console.log("OpenAI rewritten query:", rewrittenQuery);

    return rewrittenQuery || userQuery; // Fallback to original if OpenAI fails
  } catch (error) {
    console.error("Error rewriting query with OpenAI:", error);
    return userQuery; // Fallback to original query
  }
}

export async function POST(request: NextRequest) {
  console.log("Generating thumbnail", request);
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log("Body:", body);
    const {
      prompt,
      config = {
        videoTitle: '',
        primaryColor: '#DC2626',
        secondaryColor: '#2563EB',
        defaultImage: '',
        defaultImagePreview: '',
        niche: 'education',
        size: '16:9',
      },
      imageData,
      imageMimeType,
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Original prompt:", prompt);

    // Step 1: Rewrite the query using OpenAI
    const rewrittenPrompt = await rewriteQueryWithOpenAI(prompt);
    console.log("Rewritten prompt:", rewrittenPrompt);

    // Step 2: Create AI prompt for thumbnail generation using rewritten title
    const finalPrompt = createThumbnailPrompt({
      prompt: rewrittenPrompt,
      config,
    });

    console.log("Final prompt for Gemini:", finalPrompt);

    // Step 3: Generate thumbnail using Gemini
    let response;

    if (imageData) {
      // Image + Text to Image (editing existing image)
      const imagePart = {
        inlineData: {
          mimeType: imageMimeType || "image/png",
          data: imageData,
        },
      };

      console.log("Generating thumbnail with image data");
      response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [finalPrompt, imagePart],
      });
    } else if (config.defaultImagePreview) {
      // Use default image from config
      const defaultImageData = config.defaultImagePreview.split(',')[1]; // Remove data URL prefix
      const imagePart = {
        inlineData: {
          mimeType: "image/png",
          data: defaultImageData,
        },
      };

      console.log("Generating thumbnail with default image from config");
      response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [finalPrompt, imagePart],
      });
    } else {
      // Text to Image (generating new image)
      console.log("Generating thumbnail with text only");
      response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: finalPrompt,
      });
    }

    const result = response;
    console.log("Gemini response received");
    console.log("Response candidates:", result.candidates?.length || 0);

    // Extract the generated image
    for (const part of result.candidates?.[0]?.content?.parts || []) {
      console.log("Part type:", part.inlineData ? "inlineData" : "text");
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        console.log(
          "Image data extracted successfully, length:",
          imageData?.length || 0
        );
        return NextResponse.json({
          success: true,
          imageData: imageData,
          prompt: finalPrompt,
          originalTitle: prompt,
          rewrittenTitle: rewrittenPrompt,
        });
      }
    }

    console.log("No image data found in response");
    console.log("Response structure:", JSON.stringify(result, null, 2));
    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  } catch (error) {
    console.error("Thumbnail generation error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "Unknown",
    });
    return NextResponse.json(
      {
        error: "Failed to generate thumbnail",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function createThumbnailPrompt({
  prompt,
  config,
}: {
  prompt: string;
  config: {
    videoTitle: string;
    primaryColor: string;
    secondaryColor: string;
    defaultImage: string;
    defaultImagePreview?: string;
    niche: string;
    size: string;
  };
}) {
  const nicheStyles = {
    gaming: "dynamic, vibrant, with bold colors and gaming-inspired graphics, energetic typography",
    business: "professional, clean, with sophisticated layout and corporate aesthetics",
    education: "friendly, approachable, with clear typography and academic elements",
    entertainment: "creative, eye-catching, with vibrant colors and dynamic composition",
    technology: "modern, sleek, with futuristic elements and digital aesthetics",
    lifestyle: "warm, inviting, with natural lighting and comfortable settings",
  };

  const sizeFormats = {
    '16:9': '1920x1080 pixels (YouTube standard)',
    '1:1': '1080x1080 pixels (Instagram, Facebook)',
    '9:16': '1080x1920 pixels (TikTok, Stories)',
  };

  const nicheStyle = nicheStyles[config.niche as keyof typeof nicheStyles] || nicheStyles.gaming;
  const sizeFormat = sizeFormats[config.size as keyof typeof sizeFormats] || sizeFormats['16:9'];

  return `Create a professional thumbnail with the following specifications:

        Style: ${nicheStyle}
        Title: "${config.videoTitle || prompt}"
        Size: ${sizeFormat}
        
        Brand Colors:
        - Primary: ${config.primaryColor}
        - Secondary: ${config.secondaryColor}

        Requirements: 
        - ${sizeFormat} format
        - Use the specified brand colors prominently
        - High contrast and bold design
        - Professional typography for the title
        - Modern, eye-catching composition
        - Suitable for ${config.niche} content
        - Incorporate brand colors naturally into the design
        ${config.defaultImagePreview ? '- Use the provided reference image as inspiration or base' : ''}

    Make it visually striking and optimized for the specified platform and size.`;
}
