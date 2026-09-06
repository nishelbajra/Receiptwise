import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, monthlyBudget: true },
      })
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header title="Settings" />
      <div className="p-6 max-w-3xl">
        <SettingsForm
          name={user?.name || ""}
          email={user?.email || ""}
          monthlyBudget={user?.monthlyBudget ? Number(user.monthlyBudget) : null}
        />
      </div>
    </div>
  );
}
