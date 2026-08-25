import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, language, attachments, isSearchEnabled } = body;

    console.log("Gemini API call received. Language:", language, "Search Enabled:", isSearchEnabled);

    if (!process.env.GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY in environment variables");
      return NextResponse.json({ error: "Gemini API key is not configured. Please add it to your .env.local file." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Configure tools
    const tools: any[] = [];
    if (isSearchEnabled) {
      tools.push({ googleSearchRetrieval: {} });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: tools
    });

    // Construct a prompt based on language preference
    let languageContext = "Respond in English.";
    if (language === "hi") {
      languageContext = "Respond strictly in Hindi (Devanagari script).";
    } else if (language === "hng") {
      languageContext = "Respond strictly in Hinglish (Hindi written in Latin/English script, mixed naturally with English).";
    }

    const systemPrompt = `You are Clone.AI, a high-quality AI assistant. 
    User Preference: ${languageContext}
    Guidelines:
    - Be brief but very helpful.
    - Format code snippets using markdown.
    - If the user speaks in Hindi/Hinglish, maintain that language.
    - Confirm that you CAN and DO store conversation history and remember previous turns in this chat session.
    - Avoid saying you are an AI model from Google; just be Clone.AI.`;

    // Construct history prompt (last 15 messages for quota efficiency)
    const historyLimit = 15;
    const historyToProcess = messages.slice(0, -1).slice(-historyLimit);

    let conversationHistory = "";
    historyToProcess.forEach((msg: any) => {
      conversationHistory += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });

    const lastMessage = messages[messages.length - 1].content;
    const fullPrompt = `${systemPrompt}\n\n${conversationHistory}User: ${lastMessage}\nAssistant:`;

    console.log("Generating multi-modal content...");

    const parts: any[] = [{ text: fullPrompt }];

    if (attachments && attachments.length > 0) {
      attachments.forEach((att: any) => {
        // Data URL format is "data:image/png;base64,iVBOR..."
        const base64Data = att.data.split(",")[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: att.mimeType
          }
        });
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log("Generated response successfully.");

    return NextResponse.json({ role: "assistant", content: text });
  } catch (error: any) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({
      error: "Failed to generate response: " + (error.message || "Unknown error"),
      details: error.stack
    }, { status: 500 });
  }
}
