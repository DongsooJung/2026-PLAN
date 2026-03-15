"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

export function PostmanHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/postman" className="flex items-center gap-2">
            <Send className="h-6 w-6 text-orange-500" />
            <h1 className="text-xl font-bold">Postman API</h1>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/postman"
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                pathname === "/postman"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              대시보드
            </Link>
            <Link
              href="/converter"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              공문서 변환기
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              구독 관리
            </Link>
          </nav>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
