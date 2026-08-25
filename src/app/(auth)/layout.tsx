import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <Wallet className="h-8 w-8 text-sky-400" />
          <span className="text-xl font-bold">
            <span className="text-sky-400">Receipt</span>
            <span className="text-slate-100">Wise</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} ReceiptWise
      </footer>
    </div>
  );
}
