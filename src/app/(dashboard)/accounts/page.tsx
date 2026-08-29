"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus, Info, Trash2, X, Loader2 } from "lucide-react";

interface PaymentCard {
  id: string;
  accountName: string;
  institutionName: string;
  lastFourDigits: string;
  cardNetwork: string;
  accountType: string;
  createdAt: string;
}

const CARD_NETWORKS = [
  { value: "VISA", label: "Visa", color: "bg-blue-600" },
  { value: "MASTERCARD", label: "Mastercard", color: "bg-red-600" },
  { value: "AMEX", label: "American Express", color: "bg-blue-500" },
  { value: "DISCOVER", label: "Discover", color: "bg-orange-500" },
  { value: "OTHER", label: "Other", color: "bg-gray-600" },
];

export default function AccountsPage() {
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    accountName: "",
    institutionName: "",
    lastFourDigits: "",
    cardNetwork: "VISA",
    accountType: "CREDIT_CARD",
  });

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      const res = await fetch("/api/cards");
      const data = await res.json();
      if (data.cards) {
        setCards(data.cards);
      }
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add card");
        return;
      }

      setCards([data.card, ...cards]);
      setShowAddModal(false);
      setFormData({
        accountName: "",
        institutionName: "",
        lastFourDigits: "",
        cardNetwork: "VISA",
        accountType: "CREDIT_CARD",
      });
    } catch (err) {
      setError("Failed to add card");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this card?")) return;

    try {
      const res = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCards(cards.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  }

  function getNetworkInfo(network: string) {
    return CARD_NETWORKS.find((n) => n.value === network) || CARD_NETWORKS[4];
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Payment Cards" />

      <div className="p-6 space-y-6">
        {/* Info Card */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Why add your cards?
                </h4>
                <p className="text-sm text-gray-500">
                  When you upload a receipt, we automatically detect the last 4
                  digits and card type. By registering your cards here, we can
                  match transactions to the correct card and help you track
                  spending per card. In the future, we&apos;ll suggest the best card
                  for each purchase based on rewards!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards List */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-gray-900">Your Cards</CardTitle>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-red-500 animate-spin" />
              </div>
            ) : cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No cards added yet</p>
                <p className="text-sm text-gray-400 text-center max-w-md">
                  Add your credit and debit cards to automatically match them
                  with your receipts
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Card
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => {
                  const network = getNetworkInfo(card.cardNetwork);
                  return (
                    <div
                      key={card.id}
                      className="relative group bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white shadow-lg"
                    >
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-2 mb-6">
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-medium ${network.color}`}
                        >
                          {network.label}
                        </div>
                        <span className="text-xs text-gray-400">
                          {card.accountType === "CREDIT_CARD"
                            ? "Credit"
                            : "Debit"}
                        </span>
                      </div>

                      <div className="text-lg tracking-widest mb-4 font-mono">
                        •••• •••• •••• {card.lastFourDigits}
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-400 uppercase">
                            Card Name
                          </p>
                          <p className="font-medium">{card.accountName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase">
                            Bank
                          </p>
                          <p className="font-medium text-sm">
                            {card.institutionName}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Payment Card
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chase Freedom, Amex Gold"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g., Chase, American Express, Capital One"
                  value={formData.institutionName}
                  onChange={(e) =>
                    setFormData({ ...formData, institutionName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.lastFourDigits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastFourDigits: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This helps us match receipts to the correct card
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Network
                  </label>
                  <select
                    value={formData.cardNetwork}
                    onChange={(e) =>
                      setFormData({ ...formData, cardNetwork: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {CARD_NETWORKS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) =>
                      setFormData({ ...formData, accountType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Card"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
