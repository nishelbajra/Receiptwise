"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";

interface SettingsFormProps {
  name: string;
  email: string;
  monthlyBudget: number | null;
}

export function SettingsForm({ name, email, monthlyBudget }: SettingsFormProps) {
  const [fullName, setFullName] = useState(name);
  const [budget, setBudget] = useState(monthlyBudget?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          monthlyBudget: budget === "" ? null : Number(budget),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save");
      }
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <User className="h-5 w-5 text-red-500" />
          Profile and budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Monthly budget</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-8 pr-4 py-2.5"
              />
            </div>
          </div>
          {message && <p className="text-sm text-gray-600">{message}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 font-medium disabled:opacity-50"
          >
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </span>
            ) : (
              "Save changes"
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
