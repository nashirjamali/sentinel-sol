import Link from "next/link";
import { Button } from "@/components/Button/Button";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "Markets", href: "#markets" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Docs", href: "/docs" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        <span className={styles.mark}>S</span>
        Sentinels
      </Link>

      <nav className={styles.nav} aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={styles.navLink}>
            {link.label}
          </Link>
        ))}
      </nav>

      <Button href="#connect" variant="fill">
        Connect Wallet
      </Button>
    </header>
  );
}
