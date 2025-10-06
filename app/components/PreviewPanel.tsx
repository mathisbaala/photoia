import type { ReactNode } from "react";
import styles from "./PreviewPanel.module.css";

type PreviewPanelProps = {
  title: string;
  children: ReactNode;
};

export function PreviewPanel({ title, children }: PreviewPanelProps) {
  return (
    <article className={styles.panel}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.surface}>{children}</div>
    </article>
  );
}

export function PreviewImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className={styles.image} loading="lazy" />;
}

export function PreviewPlaceholder({ children }: { children: ReactNode }) {
  return <p className={styles.placeholder}>{children}</p>;
}
