import { db } from "@/lib/db";

export interface MatchedCard {
  id: string;
  accountName: string;
  institutionName: string;
  lastFourDigits: string | null;
  cardNetwork: string | null;
}

export async function matchCardForUser(
  userId: string,
  lastFourDigits?: string | null,
  cardBrand?: string | null
): Promise<MatchedCard | null> {
  const digits = lastFourDigits?.replace(/\D/g, "") ?? "";
  if (digits.length !== 4) return null;

  const cards = await db.financialAccount.findMany({
    where: {
      userId,
      lastFourDigits: digits,
      isActive: true,
      accountType: { in: ["CREDIT_CARD", "DEBIT_CARD"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (cards.length === 0) return null;

  const brand = cardBrand?.toUpperCase();
  const preferred =
    brand && brand !== "UNKNOWN"
      ? cards.find((card) => card.cardNetwork === brand || card.cardNetwork === "OTHER") || cards[0]
      : cards[0];

  return {
    id: preferred.id,
    accountName: preferred.accountName,
    institutionName: preferred.institutionName,
    lastFourDigits: preferred.lastFourDigits,
    cardNetwork: preferred.cardNetwork,
  };
}

export async function listUserCards(userId: string): Promise<MatchedCard[]> {
  const cards = await db.financialAccount.findMany({
    where: {
      userId,
      accountType: { in: ["CREDIT_CARD", "DEBIT_CARD"] },
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return cards.map((card) => ({
    id: card.id,
    accountName: card.accountName,
    institutionName: card.institutionName,
    lastFourDigits: card.lastFourDigits,
    cardNetwork: card.cardNetwork,
  }));
}
