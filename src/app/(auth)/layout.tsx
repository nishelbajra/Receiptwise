import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Wallet className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900">
              ReceiptWise
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      <footer className="border-t border-gray-100 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ReceiptWise</p>
        </div>
      </footer>
    </div>
  );
}
