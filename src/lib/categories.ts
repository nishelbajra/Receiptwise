export const SYSTEM_CATEGORIES = [
  { name: "Groceries", icon: "shopping-basket", color: "#16a34a" },
  { name: "Restaurants", icon: "utensils", color: "#ea580c" },
  { name: "Shopping", icon: "shopping-bag", color: "#7c3aed" },
  { name: "Transportation", icon: "car", color: "#2563eb" },
  { name: "Entertainment", icon: "clapperboard", color: "#db2777" },
  { name: "Healthcare", icon: "heart-pulse", color: "#dc2626" },
  { name: "Utilities", icon: "plug", color: "#0f766e" },
  { name: "Travel", icon: "plane", color: "#0284c7" },
  { name: "Education", icon: "graduation-cap", color: "#4338ca" },
  { name: "Other", icon: "circle-ellipsis", color: "#6b7280" },
] as const;

export type CategoryName = (typeof SYSTEM_CATEGORIES)[number]["name"];

export const CATEGORY_NAMES = SYSTEM_CATEGORIES.map((category) => category.name);

export function isCategoryName(value: string): value is CategoryName {
  return (CATEGORY_NAMES as string[]).includes(value);
}
