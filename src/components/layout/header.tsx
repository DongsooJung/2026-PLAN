"use client";

import { CreditCard } from "lucide-react";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">구독 관리</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
