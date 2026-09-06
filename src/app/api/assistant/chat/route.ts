import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { answerAssistantQuestion } from "@/lib/assistant/chat";

export const maxDuration = 120;

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    })
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = chatSchema.parse(await request.json());
    const answer = await answerAssistantQuestion(session.user.id, messages);
    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Assistant error:", error);
    return NextResponse.json(
      { error: "The local assistant is unavailable. Is Ollama running with qwen3:4b?" },
      { status: 503 }
    );
  }
}
