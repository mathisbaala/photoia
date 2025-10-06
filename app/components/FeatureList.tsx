import type { FeatureItem } from "@/content/features";
import styles from "./FeatureList.module.css";

type FeatureListProps = {
  items: FeatureItem[];
};

export function FeatureList({ items }: FeatureListProps) {
  return (
    <div className={styles.grid}>
      {items.map((feature) => (
        <article key={feature.title} className={styles.card}>
          <h3 className={styles.title}>{feature.title}</h3>
          <p className={styles.description}>{feature.description}</p>
        </article>
      ))}
    </div>
  );
}
