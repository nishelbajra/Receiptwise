"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Sparkles } from "lucide-react";

const sampleQuestions = [
  "How much did I spend this month?",
  "What is my biggest spending category?",
  "Show my grocery transactions",
  "Compare this month to last month",
  "How am I doing against my budget?",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Assistant unavailable");
      }
      setMessages([...nextMessages, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant unavailable");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="AI Assistant" />
      <div className="flex-1 p-6 flex flex-col">
        <Card className="flex-1 bg-white border-gray-200 shadow-sm flex flex-col">
          <CardContent className="flex-1 flex flex-col p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Spending assistant</h3>
                <p className="text-gray-500 text-center max-w-md mb-8">
                  Qwen3 4B answers from confirmed transactions only. It cannot invent or change records.
                </p>
                <div className="w-full max-w-2xl grid md:grid-cols-2 gap-2">
                  {sampleQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => send(question)}
                      className="text-left p-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:bg-red-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto w-full">
                {messages.map((item, index) => (
                  <div
                    key={`${item.role}-${index}`}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      item.role === "user"
                        ? "bg-red-500 text-white ml-12"
                        : "bg-gray-100 text-gray-800 mr-12"
                    }`}
                  >
                    {item.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking up confirmed spending...
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}
          </CardContent>
          <div className="p-4 border-t border-gray-200">
            <form
              className="flex gap-2 max-w-3xl mx-auto"
              onSubmit={(event) => {
                event.preventDefault();
                void send(message);
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about confirmed spending..."
                className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-5 py-3 text-gray-900 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center disabled:opacity-50"
                disabled={!message.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
