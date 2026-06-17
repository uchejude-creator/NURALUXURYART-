"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ADMIN_PATH_PREFIXES = ["/admin", "/auth"];

export function StorefrontChromeGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWorkspacePath = ADMIN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isWorkspacePath) {
    return null;
  }

  return <>{children}</>;
}
