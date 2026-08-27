"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

const sampleQuestions = [
  "How much did I spend this week?",
  "What's my biggest spending category?",
  "Show me all transactions at Starbucks",
  "Am I over budget this month?",
  "Which credit card should I use for groceries?",
  "What are my recurring expenses?",
];

export default function AssistantPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="AI Assistant" />
      
      <div className="flex-1 p-6 flex flex-col">
        {/* Chat Area */}
        <Card className="flex-1 bg-white border-gray-200 shadow-sm flex flex-col">
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              AI Financial Assistant
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-8">
              Ask me anything about your finances. I can help you understand 
              your spending, find transactions, and get insights.
            </p>

            {/* Sample Questions */}
            <div className="w-full max-w-2xl">
              <p className="text-sm text-gray-400 mb-3">Try asking:</p>
              <div className="grid md:grid-cols-2 gap-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="text-left p-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="mt-8 p-4 rounded-xl bg-red-50 border border-red-100 max-w-md">
              <p className="text-sm text-gray-600 text-center">
                <span className="text-red-600 font-medium">Coming in Phase 4:</span> Full conversational AI 
                with access to your financial data through secure tool functions.
              </p>
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about your finances..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-full px-5 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              <button 
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!message.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
