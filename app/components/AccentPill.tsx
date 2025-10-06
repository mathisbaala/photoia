import type { ReactNode } from "react";
import styles from "./AccentPill.module.css";

type AccentPillProps = {
  icon?: ReactNode;
  children: ReactNode;
};

export function AccentPill({ icon, children }: AccentPillProps) {
  return (
    <span className={styles.pill}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}
