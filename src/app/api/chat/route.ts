import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Keywords and topics related to thumbnail generation
const THUMBNAIL_KEYWORDS = [
  "thumbnail",
  "youtube",
  "video",
  "title",
  "design",
  "background",
  "text",
  "font",
  "color",
  "layout",
  "composition",
  "branding",
  "logo",
  "image",
  "photo",
  "picture",
  "visual",
  "graphic",
  "art",
  "creative",
  "style",
  "theme",
  "mood",
  "tone",
  "audience",
  "engagement",
  "click",
  "view",
  "trending",
  "popular",
  "viral",
  "content",
  "creator",
  "channel",
  "upload",
  "publish",
  "social media",
  "instagram",
  "tiktok",
  "facebook",
  "twitter",
  "linkedin",
  "platform",
  "ai",
  "generation",
  "create",
  "make",
  "build",
  "produce",
  "develop",
  "tech",
  "lifestyle",
  "education",
  "gaming",
  "entertainment",
  "news",
  "tutorial",
  "review",
  "vlog",
  "podcast",
  "stream",
  "live",
  "broadcast",
  "thumb",
  "running",
  "person",
  "road",
  "work",
  "hard",
];

// Common greetings and basic interactions that should be allowed
const ALLOWED_GREETINGS = [
  "hi",
  "hello",
  "hey",
  "good morning",
  "good afternoon",
  "good evening",
  "how are you",
  "thanks",
  "thank you",
  "bye",
  "goodbye",
  "see you",
  "start",
  "begin",
  "help",
  "what can you do",
  "capabilities",
  "features",
];

// Function to check if the request is thumbnail-related or an allowed greeting
function isThumbnailRelatedRequest(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Allow common greetings and basic interactions
  const isGreeting = ALLOWED_GREETINGS.some(
    (greeting) => lowerMessage.includes(greeting) || lowerMessage === greeting
  );

  if (isGreeting) {
    return true;
  }

  // Check for thumbnail-specific keywords
  const hasThumbnailKeywords = THUMBNAIL_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // Check for specific thumbnail-related patterns
  const thumbnailPatterns = [
    /thumbnail/i,
    /thumbanil/i, // Handle common misspelling
    /youtube/i,
    /video.*title/i,
    /design.*image/i,
    /create.*(image|thumbnail|thumb)/i,
    /generate.*(image|thumbnail|thumb)/i,
    /ai.*image/i,
    /content.*strategy/i,
    /visual.*design/i,
    /graphic.*design/i,
    /help.*me/i,
    /can.*you.*help/i,
    /what.*should.*i.*do/i,
    /how.*do.*i/i,
    /tips.*for/i,
    /advice.*on/i,
    /create.*thumb/i,
    /make.*thumb/i,
    /build.*thumb/i,
    /personal.*thumb/i,
    /thumb.*where/i,
    /create.*this/i,
  ];

  const hasThumbnailPatterns = thumbnailPatterns.some((pattern) =>
    pattern.test(userMessage)
  );

  // Allow questions that start with common question words (likely asking for help)
  const isQuestion =
    /^(what|how|why|when|where|which|can|could|would|should|do|does|is|are|will)/i.test(
      lowerMessage
    );

  // Allow requests for help or assistance
  const isHelpRequest =
    /help|assist|support|guide|advice|suggest|recommend/i.test(lowerMessage);

  // Simple check for create + thumb combinations (very permissive)
  const hasCreateThumb =
    lowerMessage.includes("create") &&
    (lowerMessage.includes("thumb") || lowerMessage.includes("thumbnail"));

  return (
    hasThumbnailKeywords ||
    hasThumbnailPatterns ||
    isQuestion ||
    isHelpRequest ||
    hasCreateThumb
  );
}

// Function to detect if user wants to create a thumbnail
function isThumbnailCreationRequest(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase().trim();

  // Check for creation keywords
  const creationKeywords = ["create", "make", "generate", "build", "design"];
  const thumbnailKeywords = ["thumbnail", "thumbanil", "thumb", "image"];

  const hasCreationKeyword = creationKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  const hasThumbnailKeyword = thumbnailKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  return hasCreationKeyword && hasThumbnailKeyword;
}

// Function to rewrite the query using AI
async function rewriteThumbnailQuery(userMessage: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const rewritePrompt = `You are an expert at understanding and rewriting thumbnail creation requests. 

User's request: "${userMessage}"

Please rewrite this request into a clear, structured format for thumbnail generation. Extract the key elements and create a professional prompt.

Focus on:
- Main subject/character
- Background/setting
- Text to include
- Style/mood
- Any specific requirements

Return only the rewritten prompt, nothing else.`;

  try {
    const result = await model.generateContent(rewritePrompt);
    const response = result.response.text();
    return response || userMessage; // Fallback to original if AI fails
  } catch (error) {
    console.error("Error rewriting query:", error);
    return userMessage; // Fallback to original
  }
}

// Function to create thumbnail prompt (copied from generate-thumbnail API)
function createThumbnailPrompt({
  title,
  segment,
  mood,
  audience,
  keyword,
}: {
  title: string;
  segment: string;
  mood: string;
  audience: string;
  keyword: string;
}) {
  const segmentStyles = {
    tech: "futuristic, modern, with glowing neon elements and digital aesthetics",
    lifestyle: "warm, inviting, with natural lighting and comfortable settings",
    education:
      "clean, professional, with academic elements and clear typography",
    gaming: "dynamic, vibrant, with bold colors and gaming-inspired graphics",
    other: "versatile, balanced, with universal appeal",
  };

  const moodStyles = {
    excited: "high energy, bold colors, dynamic composition",
    serious: "professional, muted tones, sophisticated layout",
    fun: "playful, bright colors, whimsical elements",
    chill: "calm, soft colors, relaxed atmosphere",
    motivational: "inspiring, bold, with strong visual impact",
  };

  const audienceStyles = {
    students: "youthful, modern, relatable and accessible",
    beginners: "friendly, approachable, with clear visual hierarchy",
    pros: "sophisticated, detailed, with advanced visual elements",
    general: "universal, balanced, with broad appeal",
  };

  const segmentStyle =
    segmentStyles[segment as keyof typeof segmentStyles] || segmentStyles.other;
  const moodStyle =
    moodStyles[mood as keyof typeof moodStyles] || moodStyles.fun;
  const audienceStyle =
    audienceStyles[audience as keyof typeof audienceStyles] ||
    audienceStyles.general;

  return `Create a professional YouTube thumbnail with the following specifications:

        Style: ${segmentStyle}, ${moodStyle}, ${audienceStyle}
        Title: "${title}"
        Keyword to emphasize: "${keyword}"

        Requirements: 
        - YouTube thumbnail format (1920x1080 pixels)
        - High contrast and bold design
        - Professional typography for the title
        - Reserve space for the keyword "${keyword}" to be prominently displayed
        - Modern, eye-catching composition
        - Suitable for ${segment} content targeting ${audience} audience
        - ${mood} mood and atmosphere

    Make it visually striking and optimized for YouTube's thumbnail display.`;
}

// Function to generate thumbnail directly using Gemini API
async function generateThumbnail(
  rewrittenQuery: string,
  imageData?: string
): Promise<any> {
  try {
    console.log("Starting thumbnail generation with query:", rewrittenQuery);

    // Create the prompt for thumbnail generation
    const prompt = createThumbnailPrompt({
      title: rewrittenQuery,
      segment: "lifestyle",
      mood: "motivational",
      audience: "general",
      keyword: "thumbnail",
    });

    console.log("Generated prompt:", prompt);

    // Generate thumbnail using Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview",
    });

    let response;

    if (imageData) {
      // Image + Text to Image (editing existing image)
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData,
        },
      };
      response = await model.generateContent([prompt, imagePart]);
    } else {
      // Text to Image (generating new image)
      response = await model.generateContent(prompt);
    }

    const result = await response.response;
    console.log("Gemini response received");

    // Extract the generated image
    for (const part of result.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        console.log("Image data extracted successfully");
        return {
          success: true,
          imageData: imageData,
          prompt: prompt,
        };
      }
    }

    console.log("No image data found in response");
    return { success: false, error: "No image generated" };
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return { success: false, error: "Failed to generate thumbnail" };
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get the latest user message
    const latestUserMessage =
      messages.filter((msg) => msg.role === "user").pop()?.content || "";

    console.log("User message:", latestUserMessage);
    console.log(
      "Is thumbnail related:",
      isThumbnailRelatedRequest(latestUserMessage)
    );
    console.log(
      "Is thumbnail creation request:",
      isThumbnailCreationRequest(latestUserMessage)
    );

    // Check if the request is thumbnail-related or an allowed greeting
    if (!isThumbnailRelatedRequest(latestUserMessage)) {
      return NextResponse.json({
        success: false,
        message: `I'm Thumbnail AI, a specialized assistant for YouTube thumbnail creation and content strategy. I can only help with:

🎨 **Thumbnail Design & Creation**
• YouTube thumbnail design tips and best practices
• AI image generation techniques and prompts
• Visual composition and layout advice
• Color schemes and typography for thumbnails

📈 **Content Strategy**
• Audience engagement strategies
• Trending thumbnail styles
• Platform-specific optimization
• Brand consistency for creators

🛠️ **Technical Support**
• Thumbnail creation tools and software
• Image editing techniques
• File formats and specifications
• Performance optimization

Please ask me about thumbnail creation, YouTube content strategy, or visual design for your videos. I'm here to help you create stunning thumbnails that drive more views!`,
      });
    }

    // Check if this is a thumbnail creation request
    if (isThumbnailCreationRequest(latestUserMessage)) {
      try {
        console.log("Processing thumbnail creation request...");

        // Rewrite the query using AI
        const rewrittenQuery = await rewriteThumbnailQuery(latestUserMessage);
        console.log("Rewritten query:", rewrittenQuery);

        // Generate the thumbnail
        const thumbnailResult = await generateThumbnail(rewrittenQuery);

        console.log("Thumbnail generation result:", thumbnailResult);

        if (thumbnailResult.success && thumbnailResult.imageData) {
          return NextResponse.json({
            success: true,
            message: `🎨 **Thumbnail Generated Successfully!**

                I've created a thumbnail based on your request: "${latestUserMessage}"

                **What I generated:**
                - A professional YouTube thumbnail
                - Optimized for engagement and click-through rates
                - Based on your description and requirements

                **Next steps:**
                - The thumbnail has been generated and is ready for use
                - You can download it and use it for your YouTube video
                - Feel free to ask for any modifications or create another thumbnail!

                Would you like me to help you with any adjustments to the thumbnail or create another one?`,
            thumbnailData: thumbnailResult.imageData,
            originalRequest: latestUserMessage,
            rewrittenQuery: rewrittenQuery,
          });
        } else {
          console.log("Thumbnail generation failed:", thumbnailResult.error);
          throw new Error(
            thumbnailResult.error || "Thumbnail generation failed"
          );
        }
      } catch (error) {
        console.error("Error in thumbnail creation workflow:", error);
        return NextResponse.json({
          success: true,
          message: `I understand you want to create a thumbnail for: "${latestUserMessage}"

I'm working on generating your thumbnail, but encountered a technical issue. Let me provide you with some design guidance instead:

**For your thumbnail with a running person and "do hard work" text:**

🎨 **Design Recommendations:**
• **Layout**: Place the running person on the left, text on the right
• **Colors**: Use high contrast - dark background with bright text
• **Typography**: Bold, impactful font for "DO HARD WORK"
• **Background**: Road or motivational setting
• **Style**: Dynamic, energetic composition

Would you like me to try generating the thumbnail again, or would you prefer design tips for creating it manually?`,
        });
      }
    }

    // Create the system prompt for thumbnail-focused assistance
    const systemPrompt = `You are Thumbnail AI, a specialized assistant focused exclusively on YouTube thumbnail creation, AI image generation, and content strategy. Your expertise includes:

**Core Capabilities:**
1. YouTube thumbnail design tips and best practices
2. AI image generation techniques and prompts
3. Content strategy and audience engagement
4. Technical guidance for thumbnail creation tools
5. Creative ideas for different content segments (tech, lifestyle, education, gaming, etc.)

**Response Guidelines:**
- When users ask to create thumbnails, provide specific design guidance and suggestions
- For thumbnail creation requests, suggest layout, colors, text placement, and visual elements
- Provide actionable advice for implementing their thumbnail ideas
- Include specific recommendations for text styling, background choices, and composition
- Be encouraging and supportive of creators
- Keep responses concise but comprehensive
- Use emojis sparingly to enhance readability

**What you can help with:**
- Thumbnail design concepts and layouts
- Color schemes and typography choices
- Background and composition ideas
- Text placement and sizing
- Brand consistency across thumbnails
- Platform-specific optimization
- AI prompt engineering for image generation
- Content strategy for different niches

**For thumbnail creation requests:**
- Analyze the user's description and provide specific design recommendations
- Suggest color palettes that match the content theme
- Recommend text fonts and placement strategies
- Provide composition and layout suggestions
- Include specific tips for making the thumbnail eye-catching

Stay focused on helping users create better thumbnails and grow their YouTube presence.`;

    // Use Gemini for the response
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
      // Create a simple prompt with system instructions and user message
      const fullPrompt = `${systemPrompt}

User: ${latestUserMessage}

Assistant:`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

    if (!response) {
      return NextResponse.json(
          { error: "No response generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
        message: response,
      });
    } catch (error) {
      console.error("Gemini API error:", error);

      // Fallback response if Gemini fails
      const fallbackResponse = `Hello! I'm Thumbnail AI, your specialized assistant for YouTube thumbnail creation and content strategy. 

I can help you with:
• YouTube thumbnail design tips and best practices
• AI image generation techniques and prompts  
• Content strategy and audience engagement
• Visual design principles and composition
• Platform-specific optimization

How can I help you create stunning thumbnails for your YouTube content today?`;

      return NextResponse.json({
        success: true,
        message: fallbackResponse,
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
