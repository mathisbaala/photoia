import Link from "next/link";
import { AccentPill } from "@/components/AccentPill";
import { FeatureList } from "@/components/FeatureList";
import { GithubCallout } from "@/components/GithubCallout";
import { features } from "@/content/features";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <AccentPill>VisionCraft Studio</AccentPill>
        <h1 className={styles.title}>
          L’atelier photo qui met l’intelligence artificielle au service de vos idées.
        </h1>
        <p className={styles.subtitle}>
          Centralisez vos visuels, décrivez les transformations souhaitées et retrouvez chaque rendu
          dans un tableau de bord sécurisé par Supabase, pensé pour les créateurs et les équipes.
        </p>
        <div className={styles.actions}>
          <Link href="/signup" className={styles.primaryAction}>
            Créer un compte gratuit
          </Link>
          <Link href="/login" className={styles.secondaryAction}>
            J’ai déjà un compte
          </Link>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.sectionTitle}>Tout ce qu’il faut pour lancer vos projets IA</h2>
          <p className={styles.sectionSubtitle}>
            Une expérience clé en main : stockage Supabase, génération Replicate et historique des
            versions dans votre dashboard.
          </p>
        </div>
        <FeatureList items={features} />
      </section>

      <GithubCallout />
    </main>
  );
}
