import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

// Initialize APIs
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced utility function to rewrite query using OpenAI
async function rewriteQueryWithOpenAI(
  userQuery: string,
  config: any
): Promise<string> {
  try {
    console.log("Rewriting query with OpenAI:", userQuery);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at understanding and rewriting thumbnail creation requests for professional AI image generation.

          Your task is to take a user's thumbnail request and rewrite it into a clear, detailed, and professional prompt for AI image generation that will create compelling thumbnails.

          Context Information:
          - Video Title: This helps understand the overall theme
          - Niche: Determines the style and approach (gaming, business, education, entertainment, technology, lifestyle)
          - Platform Size: Affects composition and text placement

          Focus on extracting and enhancing:
          - Main subject/character (make it specific and descriptive)
          - Background/setting (detailed environment description)
          - Action or emotion being portrayed
          - Key visual elements that would make it click-worthy
          - Text elements to include (if any)
          - Style/mood that matches the niche
          - Specific details that make the thumbnail engaging

          Guidelines:
          1. Make descriptions vivid and specific
          2. Include emotional triggers and psychological elements
          3. Consider what would make someone want to click
          4. Ensure the description matches the niche style
          5. Add details that weren't explicitly mentioned but would improve the thumbnail
          6. Focus on creating visual interest and engagement

          Return only the rewritten prompt, nothing else. Make it detailed and comprehensive while keeping it focused.`,
        },
        {
          role: "user",
          content: `Please rewrite this thumbnail request into a professional, detailed prompt:

Original Request: "${userQuery}"
Video Title: "${config.videoTitle || userQuery}"
Niche: "${config.niche}"
Platform Size: "${config.size}"
Primary Color: "${config.primaryColor}"
Secondary Color: "${config.secondaryColor}"

Create a detailed, engaging description that would generate a compelling thumbnail.`,
        },
      ],
      max_tokens: 500,
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

// Enhanced function to create contextual prompt based on niche and content
async function enhancePromptWithContext(
  rewrittenPrompt: string,
  config: any
): Promise<string> {
  try {
    console.log("Enhancing prompt with context using OpenAI");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert thumbnail designer and prompt engineer. Your task is to take a rewritten prompt and enhance it with specific details that will create the most engaging and professional thumbnail possible.

          Consider the following aspects:
          1. Visual composition that works for the platform size
          2. Color psychology and brand integration
          3. Niche-specific elements and aesthetics
          4. Psychological triggers for clicks
          5. Professional design principles
          6. Platform optimization
          7. Emotional engagement

          Add specific details about:
          - Facial expressions (if people are involved)
          - Lighting that enhances the mood
          - Background elements that support the story
          - Visual effects that add impact
          - Composition elements that guide the eye
          - Cultural or contextual details (if relevant)
          - Technical aspects for professional quality

          Return an enhanced version that maintains the core concept but adds rich, specific details for optimal thumbnail generation.`,
        },
        {
          role: "user",
          content: `Enhance this thumbnail prompt with rich details and professional specifications:

Base Prompt: "${rewrittenPrompt}"
Niche: "${config.niche}"
Platform: "${config.size}"
Video Title: "${config.videoTitle}"
Brand Colors: Primary ${config.primaryColor}, Secondary ${config.secondaryColor}

Make it comprehensive and detailed for professional thumbnail generation.`,
        },
      ],
      max_tokens: 600,
      temperature: 0.6,
    });

    const enhancedPrompt = completion.choices[0]?.message?.content?.trim();
    console.log("Enhanced prompt:", enhancedPrompt);

    return enhancedPrompt || rewrittenPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return rewrittenPrompt;
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
        videoTitle: "",
        primaryColor: "#DC2626",
        secondaryColor: "#2563EB",
        defaultImage: "",
        defaultImagePreview: "",
        niche: "education",
        size: "16:9",
      },
      imageData,
      imageMimeType,
    } = body;

    console.log("Thumbnail config received:", config);

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Original prompt:", prompt);

    // Step 1: Rewrite the query using OpenAI with context
    const rewrittenPrompt = await rewriteQueryWithOpenAI(prompt, config);
    console.log("Rewritten prompt:", rewrittenPrompt);

    // Step 2: Enhance the prompt with contextual details
    const enhancedPrompt = await enhancePromptWithContext(
      rewrittenPrompt,
      config
    );
    console.log("Enhanced prompt:", enhancedPrompt);

    // Step 3: Create final AI prompt for thumbnail generation
    const finalPrompt = createThumbnailPrompt({
      prompt: enhancedPrompt,
      config,
    });

    console.log("Final prompt for Gemini:", finalPrompt);

    // Step 4: Generate thumbnail using Gemini
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
      const defaultImageData = config.defaultImagePreview.split(",")[1]; // Remove data URL prefix
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
          enhancedPrompt: enhancedPrompt,
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
    gaming: {
      style:
        "dynamic, vibrant, with bold colors and gaming-inspired graphics, energetic typography",
      lighting:
        "dramatic neon lighting with RGB accents, glowing effects, cyberpunk-inspired illumination",
      composition:
        "action-packed, diagonal compositions, explosive visual elements",
      textStyle:
        "bold, futuristic fonts with glowing effects and gaming aesthetics",
    },
    business: {
      style:
        "professional, clean, with sophisticated layout and corporate aesthetics",
      lighting:
        "professional studio lighting with soft shadows, clean white balance",
      composition: "balanced, symmetrical layout with clear focal points",
      textStyle: "clean, modern sans-serif typography with high contrast",
    },
    education: {
      style:
        "friendly, approachable, with clear typography and academic elements",
      lighting:
        "bright, natural lighting with even illumination, educational clarity",
      composition:
        "organized, grid-based layouts with clear information hierarchy",
      textStyle:
        "readable, educational fonts with clear contrast and accessibility",
    },
    entertainment: {
      style:
        "creative, eye-catching, with vibrant colors and dynamic composition",
      lighting:
        "colorful, dramatic lighting with creative shadows and highlights",
      composition:
        "dynamic, asymmetrical layouts with visual tension and excitement",
      textStyle:
        "playful, bold typography with creative effects and animations",
    },
    technology: {
      style: "modern, sleek, with futuristic elements and digital aesthetics",
      lighting:
        "cool-toned LED lighting with precise highlights, tech-inspired illumination",
      composition: "geometric, precise layouts with technological elements",
      textStyle: "sleek, modern fonts with digital effects and tech aesthetics",
    },
    lifestyle: {
      style: "warm, inviting, with natural lighting and comfortable settings",
      lighting: "warm, golden hour lighting with soft natural illumination",
      composition: "organic, comfortable layouts with natural flow and balance",
      textStyle: "friendly, approachable fonts with warm, inviting aesthetics",
    },
  };

  const sizeFormats = {
    "16:9": {
      dimensions: "1920x1080 pixels (YouTube standard)",
      aspectRatio: "16:9 landscape orientation",
      textPlacement: "upper third or lower third rule positioning",
      visualFocus: "horizontal composition with left-right balance",
    },
    "1:1": {
      dimensions: "1080x1080 pixels (Instagram, Facebook)",
      aspectRatio: "1:1 square format",
      textPlacement: "centered or rule of thirds positioning",
      visualFocus: "centered composition with radial balance",
    },
    "9:16": {
      dimensions: "1080x1920 pixels (TikTok, Stories)",
      aspectRatio: "9:16 vertical orientation",
      textPlacement: "upper and lower thirds for mobile viewing",
      visualFocus: "vertical composition with top-bottom flow",
    },
  };

  const lightingPresets = {
    dramatic:
      "dramatic studio lighting with strong shadows, rim lighting effects, high contrast illumination",
    professional:
      "professional photography lighting with soft diffused light, minimal shadows",
    cinematic:
      "cinematic lighting with warm/cool color temperature contrast, film-grade illumination",
    natural:
      "natural daylight simulation with soft shadows and realistic color rendering",
    neon: "vibrant neon lighting with glowing effects, RGB color schemes, cyberpunk aesthetics",
    golden:
      "golden hour lighting with warm tones, soft shadows, and natural glow",
  };

  const compositionRules = {
    ruleOfThirds: "position key elements along rule of thirds grid lines",
    goldenRatio: "use golden ratio for optimal visual balance and focal points",
    symmetrical: "perfectly balanced symmetrical composition",
    diagonal: "dynamic diagonal composition for visual energy",
    centered: "strong central focus with supporting elements",
    asymmetrical: "creative asymmetrical balance for visual interest",
  };

  const colorTheory = {
    complementary:
      "use complementary colors for maximum contrast and visual impact",
    analogous:
      "harmonious color palette with adjacent colors on the color wheel",
    triadic: "balanced three-color scheme for vibrant yet harmonious design",
    monochromatic:
      "single color with various tints and shades for sophisticated look",
  };

  const nicheConfig =
    nicheStyles[config.niche as keyof typeof nicheStyles] || nicheStyles.gaming;
  const formatConfig =
    sizeFormats[config.size as keyof typeof sizeFormats] || sizeFormats["16:9"];

  // Advanced lighting selection based on niche
  let selectedLighting = lightingPresets.professional;
  switch (config.niche) {
    case "gaming":
      selectedLighting = lightingPresets.neon;
      break;
    case "business":
      selectedLighting = lightingPresets.professional;
      break;
    case "education":
      selectedLighting = lightingPresets.natural;
      break;
    case "entertainment":
      selectedLighting = lightingPresets.dramatic;
      break;
    case "technology":
      selectedLighting = lightingPresets.cinematic;
      break;
    case "lifestyle":
      selectedLighting = lightingPresets.golden;
      break;
  }

  return `Create a professional, high-impact thumbnail with the following detailed specifications:

ENHANCED CONTENT DESCRIPTION:
${prompt}

CORE SPECIFICATIONS:
- Title: "${config.videoTitle || "Featured Content"}"
- Niche Style: ${nicheConfig.style}
- Target Audience: ${config.niche} content viewers

TECHNICAL SPECIFICATIONS:
- Format: ${formatConfig.dimensions}
- Aspect Ratio: ${formatConfig.aspectRatio}
- Resolution: Ultra-high resolution for crisp detail at all sizes
- File Format: Optimized for web delivery with maximum quality

LIGHTING & VISUAL EFFECTS:
- Primary Lighting: ${selectedLighting}
- Secondary Lighting: ${nicheConfig.lighting}
- Depth: Create depth with foreground, midground, and background layers
- Contrast: High contrast for mobile visibility and platform optimization
- Shadows: Strategic shadow placement for dimension and visual interest

COMPOSITION & LAYOUT:
- Layout Style: ${formatConfig.visualFocus}
- Text Placement: ${formatConfig.textPlacement}
- Composition Rule: ${compositionRules.ruleOfThirds}
- Visual Hierarchy: Clear primary, secondary, and tertiary visual elements
- Focal Points: Strategic placement using golden ratio principles

COLOR PALETTE & BRANDING:
- Primary Brand Color: ${config.primaryColor} (dominant color, 40% usage)
- Secondary Brand Color: ${config.secondaryColor} (accent color, 30% usage)
- Supporting Colors: Complementary colors that enhance brand colors (30% usage)
- Color Strategy: ${colorTheory.complementary}
- Color Psychology: Colors that evoke appropriate emotional response for ${
    config.niche
  }

TYPOGRAPHY & TEXT DESIGN:
- Font Style: ${nicheConfig.textStyle}
- Text Hierarchy: Maximum 5 words in primary text, clear size differentiation
- Readability: High contrast text-to-background ratio (minimum 4.5:1)
- Mobile Optimization: Text readable at 150x84 pixel thumbnail size
- Text Effects: Subtle shadows, outlines, or glow for clarity

ADVANCED VISUAL ELEMENTS:
- Background: Multi-layered background with depth and visual interest
- Textures: Subtle textures that enhance without overwhelming
- Visual Effects: Professional-grade effects (gradients, glows, highlights)
- Element Positioning: Strategic placement for maximum click-through appeal
- Negative Space: Effective use of whitespace for visual breathing room

EMOTIONAL & PSYCHOLOGICAL TRIGGERS:
- Emotional Hook: Design elements that create curiosity, excitement, or urgency
- Visual Psychology: Use of proven thumbnail psychology (faces, contrast, arrows)
- Attention Grabbing: Elements that make the thumbnail stand out in feed
- Target Audience: Designed specifically for ${
    config.niche
  } audience preferences

PLATFORM OPTIMIZATION:
- Platform: Optimized for ${config.size} format viewing
- Mobile-First: Ensure clarity and impact on mobile devices
- Competition: Stand out from typical ${config.niche} thumbnails
- Algorithm-Friendly: Design elements that perform well with platform algorithms

QUALITY STANDARDS:
- Professional Grade: Studio-quality visual production
- Brand Consistency: Aligns with overall brand aesthetic
- Scalability: Looks great from large displays to small mobile screens
- Click-Worthy: Designed to maximize click-through rates
${
  config.defaultImagePreview
    ? "- Reference Integration: Seamlessly incorporate provided reference image while enhancing with above specifications"
    : ""
}

Generate a thumbnail that combines all these elements into a cohesive, professional, and highly engaging design that will perform exceptionally well on social media platforms and drive maximum engagement.`;
}
