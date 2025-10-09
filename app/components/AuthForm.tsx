"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  defaultTab?: "login" | "signup";
};

const tabs: Array<{ id: "login" | "signup"; label: string }> = [
  { id: "login", label: "Connexion" },
  { id: "signup", label: "Inscription" },
];

export function AuthForm({ defaultTab = "login" }: AuthFormProps) {
  const router = useRouter();
  const { supabase, signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignup = activeTab === "signup";
  const isPasswordValid = password.length >= 6;
  const canSubmit =
    email.trim().length > 3 &&
    isPasswordValid &&
    (!isSignup || (confirmPassword.length > 0 && confirmPassword === password));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas.");
        }
        const result = await signUp({ email, password });
        if (result.emailConfirmationRequired) {
          setSuccess("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.");
          setPassword("");
          setConfirmPassword("");
          setActiveTab("login");
        } else {
          router.push("/dashboard");
        }
      } else {
        await signIn({ email, password });
        router.push("/dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de finaliser l'authentification.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (socialLoading) {
      return;
    }

    try {
      setSocialLoading(true);
      setError(null);
      setSuccess(null);

      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: origin
          ? {
              redirectTo: `${origin}/auth/callback?next=/dashboard`,
            }
          : undefined,
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de lancer la connexion Google pour le moment.";
      setError(message);
    } finally {
      setSocialLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.oauthButton}
        onClick={handleGoogleSignIn}
        disabled={socialLoading || loading}
      >
        <span className={styles.oauthIcon} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#EA4335"
              d="M12 10.2v3.6h5.1c-.2 1.2-1.4 3.5-5.1 3.5-3.1 0-5.6-2.6-5.6-5.8s2.5-5.8 5.6-5.8c1.8 0 3 .8 3.6 1.4l2.4-2.3C16.4 3.4 14.4 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 8.9-3.8 8.9-9.2 0-.6-.1-1-.2-1.6H12z"
            />
          </svg>
        </span>
        {socialLoading ? "Connexion en cours…" : "Continuer avec Google"}
      </button>

      <div className={styles.oauthSeparator}>
        <span className={styles.separatorLine} />
        <span className={styles.separatorLabel}>ou</span>
        <span className={styles.separatorLine} />
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
              setSuccess(null);
            }}
            className={tab.id === activeTab ? styles.activeTab : styles.tab}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          className={styles.input}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nom@exemple.com"
        />

        <label className={styles.label} htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          className={styles.input}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Au moins 6 caractères"
        />
        <p className={styles.hint}>Il doit contenir au minimum 6 caractères.</p>

        {isSignup && (
          <>
            <label className={styles.label} htmlFor="confirm">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </>
        )}

        <button type="submit" className={styles.submit} disabled={!canSubmit || loading}>
          {loading
            ? "Traitement en cours…"
            : isSignup
              ? "Créer un compte"
              : "Se connecter"}
        </button>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {success && <p className={styles.success}>{success}</p>}

        <p className={styles.switch}>
          {isSignup ? (
            <>
              Déjà inscrit ? <Link href="/login">Connectez-vous</Link>
            </>
          ) : (
            <>
              Nouveau sur VisionCraft ? <Link href="/signup">Créez un compte</Link>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
