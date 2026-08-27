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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <Wallet className="h-8 w-8 text-red-500" />
        <span className="text-xl font-bold text-gray-900">
          ReceiptWise
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
                  ? "bg-red-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500 mb-3">Quick Actions</p>
          <Link
            href="/receipts/upload"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Receipt className="h-4 w-4" />
            Upload Receipt
          </Link>
        </div>
      </div>
    </aside>
  );
}
