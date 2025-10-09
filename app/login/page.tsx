import { AccentPill } from "@/components/AccentPill";
import { AuthForm } from "@/components/AuthForm";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <AccentPill>VisionCraft Studio</AccentPill>
          <h1 className={styles.title}>Connectez-vous pour retrouver vos projets IA.</h1>
          <p className={styles.subtitle}>
            Accédez à votre tableau de bord, téléversez de nouvelles images et gardez un historique
            complet de vos transformations.
          </p>
        </div>
        <AuthForm defaultTab="login" />
      </div>
    </main>
  );
}
