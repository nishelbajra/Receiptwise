"use client";

import { Bell } from "lucide-react";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          {title && <h1 className="text-xl font-semibold text-slate-100">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-sky-500" />
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
