import { AccentPill } from "@/components/AccentPill";
import { AuthForm } from "@/components/AuthForm";
import styles from "../login/page.module.css";

export default function SignupPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <AccentPill>VisionCraft Studio</AccentPill>
          <h1 className={styles.title}>Créez un compte et lancez vos premières créations IA.</h1>
          <p className={styles.subtitle}>
            Centralisez vos projets, suivez chaque version générée et sécurisez vos galeries grâce à
            Supabase.
          </p>
        </div>
        <AuthForm defaultTab="signup" />
      </div>
    </main>
  );
}
