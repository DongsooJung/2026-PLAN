"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, BarChart3 } from "lucide-react";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/converter" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">공문서 변환기</h1>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/converter"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === "/converter"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              변환
            </Link>
            <Link
              href="/converter/history"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                pathname === "/converter/history"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="h-3.5 w-3.5" />
              이력
            </Link>
            <Link
              href="/dashboard/ccusage"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                pathname === "/dashboard/ccusage"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              CC Usage
            </Link>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
