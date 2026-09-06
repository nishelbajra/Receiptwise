import { ollamaStructured } from "@/lib/ollama";
import {
  ASSISTANT_TOOLS,
  runAssistantTool,
  type AssistantToolName,
  type ToolArgs,
} from "@/lib/assistant/tools";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ToolDecision {
  needTool: boolean;
  tool: AssistantToolName | "";
  args: ToolArgs;
  answer: string;
}

const DECISION_SCHEMA = {
  type: "object",
  properties: {
    needTool: { type: "boolean" },
    tool: { type: "string", enum: [...ASSISTANT_TOOLS, ""] },
    args: {
      type: "object",
      properties: {
        month: { type: "string" },
        month_a: { type: "string" },
        month_b: { type: "string" },
        category: { type: "string" },
        merchant: { type: "string" },
        limit: { type: "number" },
      },
    },
    answer: { type: "string" },
  },
  required: ["needTool", "tool", "args", "answer"],
};

function systemPrompt(now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const year = now.getFullYear();
  return [
    "You are ReceiptWise, a read-only spending assistant.",
    "You may only use these tools: get_spending_summary(month), get_spending_by_category(month), get_transactions(filters), compare_months(month_a, month_b), get_budget_status().",
    `Today is ${today}. The current year is ${year}.`,
    `Months are YYYY-MM. If the user says a month with no year, use ${year} (July means ${year}-07).`,
    "Do not use 2023 or any other past year unless the user names that year.",
    "Use current if the user does not specify a month.",
    "Never invent transactions, totals, merchants, or budget numbers.",
    "Never create, edit, or delete financial records.",
    "If a tool result is empty, say there are no confirmed transactions for that filter.",
    "If the question is not about the user's confirmed spending, say you can only answer from saved receipts.",
  ].join(" ");
}

export async function answerAssistantQuestion(userId: string, messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user")?.content || "";
  const history = messages
    .slice(-8)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  let toolContext = "";
  for (let round = 0; round < 3; round += 1) {
    const decision = await ollamaStructured<ToolDecision>(
      [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: [
            "Conversation:",
            history,
            toolContext ? `\nTool results:\n${toolContext}` : "",
            "\nIf you already have the numbers, set needTool=false and answer.",
            "Otherwise pick exactly one tool.",
          ].join("\n"),
        },
      ],
      DECISION_SCHEMA,
      { temperature: 0 }
    );

    if (!decision.needTool || !decision.tool) {
      return decision.answer || "I can only answer from your confirmed transactions.";
    }

    if (!ASSISTANT_TOOLS.includes(decision.tool)) {
      return "I can only look up confirmed spending with the available read-only tools.";
    }

    const result = await runAssistantTool(userId, decision.tool, decision.args || {}, lastUser);
    toolContext += `\n${decision.tool}(${JSON.stringify(decision.args || {})}) => ${JSON.stringify(result)}`;
  }

  return "I could not finish that lookup. Try asking about this month's spending or a specific category.";
}
