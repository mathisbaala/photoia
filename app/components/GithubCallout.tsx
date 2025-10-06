import Link from "next/link";
import styles from "./GithubCallout.module.css";
import { GithubIcon } from "@/components/icons";

export function GithubCallout() {
  return (
    <aside className={styles.card}>
      <div className={styles.iconWrap} aria-hidden="true">
        <GithubIcon className={styles.icon} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>Flux GitHub prêt à l’emploi</p>
        <p className={styles.copy}>
          Chaque branche et pull request déclenche automatiquement les vérifications lint, typecheck et build. Ajoute
          tes secrets dans GitHub et fusionne sereinement.
        </p>
      </div>
      <Link
        href="https://github.com/mathisbaala/photoia"
        className={styles.button}
        target="_blank"
        rel="noreferrer"
      >
        Ouvrir le dépôt
      </Link>
    </aside>
  );
}
