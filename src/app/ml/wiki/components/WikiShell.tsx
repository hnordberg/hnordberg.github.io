import type { ReactNode } from "react";
import WikiSidebar from "./WikiSidebar";

type WikiShellProps = {
  children: ReactNode;
  /** Widen the content column for data-heavy pages (e.g. the Topics filter). */
  wide?: boolean;
};

export default function WikiShell({ children, wide = false }: WikiShellProps) {
  const contentClass = wide
    ? "wiki-shell-content wiki-shell-content--wide"
    : "wiki-shell-content";

  return (
    <main className="wiki-shell">
      <WikiSidebar />
      <div className={contentClass}>{children}</div>
    </main>
  );
}
