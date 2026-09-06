import { db } from "@/lib/db";
import { isCategoryName, SYSTEM_CATEGORIES } from "@/lib/categories";

export async function ensureSystemCategories() {
  for (const category of SYSTEM_CATEGORIES) {
    const existing = await db.category.findFirst({
      where: { name: category.name, isSystem: true },
    });
    if (!existing) {
      await db.category.create({
        data: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          isSystem: true,
        },
      });
    }
  }
}

export async function getOrCreateCategory(name: string) {
  const categoryName = isCategoryName(name) ? name : "Other";
  await ensureSystemCategories();
  const category = await db.category.findFirst({
    where: { name: categoryName, isSystem: true },
  });
  if (!category) {
    throw new Error(`Missing system category: ${categoryName}`);
  }
  return category;
}
