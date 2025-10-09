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
  const { signIn, signUp } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className={styles.card}>
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
