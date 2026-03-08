"use client";

import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer className={cn("mx-auto w-full max-w-2xl border-t border-slate-500 pt-8 text-center text-xs text-slate-500", className)}>
      <p className="mb-2">
        <a href="/privacy-policy" className="hover:text-sky-500 hover:underline">
          隐私政策
        </a>
        <span className="mx-1">|</span>
        <a href="/agreement" className="hover:text-sky-500 hover:underline">
          使用条款
        </a>
        <span className="mx-1">|</span>
        <a href="/commercial-disclosure" className="hover:text-sky-500 hover:underline">
          商业声明
        </a>
      </p>
      <p>© 2026 My 9 Games | 构成我的9款游戏</p>
    </footer>
  );
}
