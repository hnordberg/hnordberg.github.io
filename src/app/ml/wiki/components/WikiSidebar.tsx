"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../../../components/SidebarNav.module.css";

type NavItem = {
  href: string;
  label: string;
  /** When true, only an exact pathname match counts as active. */
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/ml/wiki", label: "Overview", exact: true },
  { href: "/ml/wiki/paths", label: "Learning Paths" },
  { href: "/ml/wiki/topics", label: "Topics" },
  { href: "/ml/wiki/tags", label: "Tags" },
  { href: "/ml/wiki/study", label: "Flashcards" },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function WikiSidebar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className={styles.sidebar} aria-label="ML Wiki sections">
      <div className={styles.title}>ML Wiki</div>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const className = active
            ? `${styles.link} ${styles.active}`
            : styles.link;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={className}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
