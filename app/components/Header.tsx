"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./Header.module.css";

export function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  async function handleSignOut() {
    try {
      setSignOutError(null);
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossible de se déconnecter.";
      setSignOutError(message);
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          VisionCraft Studio
        </Link>
        <nav className={styles.nav}>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.link}>
                Tableau de bord
              </Link>
              <span className={styles.userEmail}>{user.email}</span>
              <button
                type="button"
                onClick={handleSignOut}
                className={styles.signOut}
                disabled={loading}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              {!isAuthPage && (
                <Link href="/login" className={styles.link}>
                  Connexion
                </Link>
              )}
              <Link href="/signup" className={styles.primaryLink}>
                Créer un compte
              </Link>
            </>
          )}
        </nav>
      </div>
      {signOutError && <p className={styles.error}>{signOutError}</p>}
    </header>
  );
}
