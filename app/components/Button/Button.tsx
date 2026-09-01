import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "fill" | "stroke" | "text";

type ButtonProps = {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  icon?: ReactNode;
};

export function Button({ href, variant = "fill", children, icon }: ButtonProps) {
  return (
    <Link href={href} className={`${styles.button} ${styles[variant]}`}>
      {children}
      {icon}
    </Link>
  );
}
