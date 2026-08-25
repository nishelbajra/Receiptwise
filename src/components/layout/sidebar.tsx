"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  ArrowLeftRight,
  CreditCard,
  PieChart,
  MessageSquare,
  Settings,
  Wallet,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Receipts", href: "/receipts", icon: Receipt },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Accounts", href: "/accounts", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: PieChart },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        <Wallet className="h-8 w-8 text-sky-400" />
        <span className="text-xl font-bold">
          <span className="text-sky-400">Receipt</span>
          <span className="text-slate-100">Wise</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sky-500/10 text-sky-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <p className="text-xs text-slate-400 mb-2">Quick Actions</p>
          <Link
            href="/receipts/upload"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Receipt className="h-4 w-4" />
            Upload Receipt
          </Link>
        </div>
      </div>
    </aside>
  );
}
