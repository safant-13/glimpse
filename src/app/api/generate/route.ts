import { NextResponse } from "next/server";
import { generateCode } from "@/services/aiService";

export async function POST(request: Request) {
  try {
    const { prompt, framework, provider, apiKey } = await request.json();
    console.log("API request received:", { prompt, framework, provider, apiKey: "[hidden]" });
    const code = await generateCode(prompt, framework, provider, apiKey);
    return NextResponse.json({ code });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}