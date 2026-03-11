"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Building2, Database } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="font-bold">구독 관리</span>
          </Link>
          <Link
            href="/dashboard/real-estate"
            className={`flex items-center gap-2 ${pathname === "/dashboard/real-estate" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <Building2 className="h-5 w-5" />
            <span className="font-bold">실거래가</span>
          </Link>
          <Link
            href="/dashboard/data-collect"
            className={`flex items-center gap-2 ${pathname === "/dashboard/data-collect" ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          >
            <Database className="h-5 w-5" />
            <span className="font-bold">데이터 수집</span>
          </Link>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
