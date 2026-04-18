import type { ReactNode } from "react";

interface LayoutLoginProps {
  readonly children: ReactNode;
}

export function LayoutLogin({ children }: LayoutLoginProps) {
  return <main className="min-h-screen w-full flex flex-col">{children}</main>;
}
