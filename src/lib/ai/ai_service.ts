import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced utility function to rewrite query using OpenAI
export async function rewriteQueryWithOpenAI(
  userQuery: string,
  config: any
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at rewriting user requests into detailed, professional prompts for an AI image generator to create compelling thumbnails. Focus on extracting and enhancing the main subject, background, action, emotion, and key visual elements. Make descriptions vivid and specific to create visual interest. Return only the rewritten prompt.`,
        },
        {
          role: "user",
          content: `Rewrite this thumbnail request into a professional, detailed prompt:
  
          Original Request: "${userQuery}"
          Video Title: "${config.videoTitle || userQuery}"
          Niche: "${config.niche}"`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || userQuery;
  } catch (error) {
    console.error("Error rewriting query with OpenAI:", error);
    return userQuery; // Fallback to original query
  }
}

// Enhanced function to create contextual prompt based on niche and content
export async function enhancePromptWithContext(
  rewrittenPrompt: string,
  config: any
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert thumbnail designer and prompt engineer. Enhance the given prompt by adding rich details about composition, professional lighting, color psychology, and emotional engagement suitable for the specified niche. Focus on what makes a thumbnail click-worthy. Return only the enhanced prompt.`,
        },
        {
          role: "user",
          content: `Enhance this thumbnail prompt with rich details and professional specifications:
  
          Base Prompt: "${rewrittenPrompt}"
          Niche: "${config.niche}"
          Video Title: "${config.videoTitle}"
          Brand Colors: Primary ${config.primaryColor}, Secondary ${config.secondaryColor}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.6,
    });
    console.log("Completion:", completion.choices[0]?.message?.content?.trim());
    return completion.choices[0]?.message?.content?.trim() || rewrittenPrompt;
  } catch (error) {
    console.error("Error enhancing prompt with OpenAI:", error);
    return rewrittenPrompt; // Fallback to rewritten prompt
  }
}
