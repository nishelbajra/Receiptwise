"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { useState } from "react";

const sampleQuestions = [
  "How much did I spend today?",
  "What did I spend the most on this month?",
  "How much have I spent on groceries?",
  "Am I on track with my budget?",
  "Show me my spending trends",
  "What are my recurring expenses?",
];

export default function AssistantPage() {
  const [input, setInput] = useState("");

  return (
    <>
      <Header title="AI Assistant" />
      <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Your Financial AI Assistant
            </h2>
            <p className="text-slate-400 max-w-md mb-8">
              Ask questions about your spending in plain English. I&apos;ll analyze your actual 
              transaction data to give you accurate, personalized answers.
            </p>

            {/* Sample questions */}
            <div className="w-full max-w-2xl">
              <p className="text-sm text-slate-500 mb-3">Try asking:</p>
              <div className="grid grid-cols-2 gap-2">
                {sampleQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setInput(question)}
                    className="text-left p-3 rounded-lg border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-sm text-slate-300 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 text-slate-500 inline mr-2" />
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input area */}
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardContent className="p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Implement AI chat in Phase 4
                  console.log("Message:", input);
                }}
                className="flex gap-3"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="flex-1 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-slate-500 mt-2">
                The AI assistant uses your actual transaction data. It never makes up information.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming soon notice */}
        <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
          <p className="text-sm text-amber-400">
            <strong>Phase 1 Preview:</strong> AI chat UI is ready. Conversational AI will be enabled in Phase 4.
          </p>
        </div>
      </div>
    </>
  );
}
