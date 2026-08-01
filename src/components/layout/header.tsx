"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History } from "lucide-react";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href={isDemoMode ? "/dashboard" : "/converter"}
            className="flex items-center gap-2"
          >
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">공문서 변환기</h1>
          </Link>
          {!isDemoMode && (
            <nav className="flex items-center gap-1">
              <Link
                href="/converter"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  pathname === "/converter"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
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
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <History className="h-3.5 w-3.5" />
                이력
              </Link>
            </nav>
          )}
        </div>
        {isDemoMode ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            읽기 전용 데모
          </span>
        ) : (
          <UserMenu />
        )}
      </div>
    </header>
  );
}
