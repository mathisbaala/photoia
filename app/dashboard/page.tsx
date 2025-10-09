"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AccentPill } from "@/components/AccentPill";
import { GithubCallout } from "@/components/GithubCallout";
import { PreviewImage, PreviewPanel, PreviewPlaceholder } from "@/components/PreviewPanel";
import { UploadCloudIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/lib/database.types";
import styles from "./page.module.css";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const DEFAULT_PROMPT = "Rends l'image plus lumineuse et ajoute un style aquarelle";

export default function DashboardPage() {
  const { supabase, user, loading: authLoading } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const promptLength = prompt.trim().length;
  const isReady = Boolean(file && promptLength > 3);

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects(() => []);
      setProjectsLoading(false);
      return;
    }

    setProjectsLoading(true);
    setProjectsError(null);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors du chargement des projets Supabase", error);
      setProjectsError("Impossible de charger vos projets Supabase pour le moment.");
      setProjects(() => []);
    } else {
      setProjects(() => (data ?? []) as Project[]);
    }

    setProjectsLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!copiedPromptId) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedPromptId(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [copiedPromptId]);

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return projects;
    }
    return projects.filter((project) => project.prompt?.toLowerCase().includes(query));
  }, [projects, searchTerm]);

  const totalProjects = projects.length;
  const filteredCount = filteredProjects.length;
  const hasActiveFilter = Boolean(searchTerm.trim());
  const skeletonCount = Math.min(Math.max(totalProjects || 3, 3), 6);

  const dropzoneClassName = useMemo(
    () =>
      [
        styles.dropzone,
        isDragging ? styles.dropzoneActive : "",
        file ? styles.dropzoneFilled : "",
      ]
        .filter(Boolean)
        .join(" "),
    [file, isDragging],
  );

  function resetFeedback() {
    setGeneratedUrl(null);
    setStatus("");
    setError(null);
  }

  function loadFile(selected: File | null) {
    if (!selected) {
      setFile(null);
      setPreview(null);
      resetFeedback();
      return;
    }

    setFile(selected);
    resetFeedback();

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(selected);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    loadFile(selected);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (!isDragging) {
      setDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0] ?? null;
    loadFile(dropped);
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setPrompt(DEFAULT_PROMPT);
    resetFeedback();
  }

  function handleReusePrompt(nextPrompt: string | null) {
    if (!nextPrompt) {
      return;
    }

    setPrompt(nextPrompt);
    setStatus("Prompt prêt à être regénéré ✨");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleCopyPrompt(projectId: string, projectPrompt: string | null) {
    if (!projectPrompt) {
      return;
    }

    try {
      setProjectsError(null);
      await navigator.clipboard.writeText(projectPrompt);
      setStatus("Prompt copié dans le presse-papiers ✅");
      setCopiedPromptId(projectId);
    } catch (copyError) {
      console.error("Erreur lors de la copie du prompt", copyError);
      setProjectsError("Impossible de copier le prompt sur cet appareil.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !isReady || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Étape 1/3 — préparation de la génération…");
    setGeneratedUrl(null);

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("prompt", prompt);

      setStatus("Étape 2/3 — génération IA en cours…");
      const response = await fetch("/api/generate", {
        method: "POST",
        body,
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Une erreur est survenue.");
      }

      setStatus("Étape 3/3 — archivage Supabase…");
      const data = (await response.json()) as { outputUrl: string };
      setGeneratedUrl(data.outputUrl);
      setStatus("Génération terminée ✔️");
      await loadProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de générer l'image.";
      setError(message);
      setStatus("Échec de la génération.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    setDeletingId(projectId);
    setProjectsError(null);
    setStatus("Suppression du projet en cours…");

    try {
      const response = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Impossible de supprimer ce projet.");
      }

      setProjects((previous) => previous.filter((project) => project.id !== projectId));
      setStatus("Projet supprimé ✔️");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "La suppression du projet a échoué.";
      setProjectsError(message);
      setStatus("Impossible de supprimer le projet.");
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return (
      <main className={styles.main}>
        <section className={styles.container}>
          <p>Chargement de votre espace sécurisé…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.main}>
        <section className={styles.container}>
          <p>
            Vous devez être connecté pour accéder à ce contenu.{" "}
            <Link href="/login">Retour à la connexion</Link>
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <header className={styles.hero}>
          <AccentPill>Bienvenue {user.email}</AccentPill>
          <h1 className={styles.title}>Créez, versionnez et partagez vos images IA.</h1>
          <p className={styles.subtitle}>
            Téléversez un visuel, décrivez la transformation désirée et retrouvez toutes vos
            productions dans votre espace personnel. Chaque projet est isolé grâce à Supabase.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.formCard} noValidate>
          <div className={styles.formGrid}>
            <label
              className={dropzoneClassName}
              htmlFor="image-upload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={handleFileChange}
              />
              <UploadCloudIcon className={styles.dropzoneIcon} />
              <span className={styles.dropzoneText}>
                {file ? file.name : "Glissez-déposez ou sélectionnez une image"}
              </span>
              <span className={styles.dropzoneHint}>PNG, JPG ou WebP — 10 Mo max.</span>
            </label>

            <div className={styles.textareaBlock}>
              <label className={styles.textareaLabel} htmlFor="prompt">
                Décrivez la transformation souhaitée
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                maxLength={280}
                className={styles.textarea}
                placeholder="Ex : transforme la scène en style cyberpunk avec palette violette"
              />
              <div className={styles.helperRow}>
                <span className={styles.helperText}>Minimum 4 caractères</span>
                <span className={styles.helperCount}>{promptLength} / 280</span>
              </div>
              <div className={styles.actions}>
                <button type="submit" disabled={!isReady || loading} className={styles.submit}>
                  {loading ? "Génération en cours…" : "Générer"}
                </button>
                <button type="button" onClick={handleReset} className={styles.secondary}>
                  Réinitialiser
                </button>
                <div className={styles.feedback} aria-live="polite">
                  {status && <p className={styles.status}>{status}</p>}
                  {error && (
                    <p className={styles.error} role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.previewGrid}>
            <PreviewPanel title="Prévisualisation">
              {preview ? (
                <PreviewImage src={preview} alt="Prévisualisation de l'image téléversée" />
              ) : (
                <PreviewPlaceholder>
                  Ajoutez une image pour visualiser le rendu avant envoi.
                </PreviewPlaceholder>
              )}
            </PreviewPanel>
            <PreviewPanel title="Résultat IA">
              {generatedUrl ? (
                <PreviewImage src={generatedUrl} alt="Image générée par l'IA" />
              ) : (
                <PreviewPlaceholder>
                  Les images générées s’afficheront ici après traitement.
                </PreviewPlaceholder>
              )}
            </PreviewPanel>
          </div>
        </form>

        <section className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <div>
              <h2 className={styles.projectsTitle}>Mes projets</h2>
              <p className={styles.projectsSubtitle}>
                Historique des transformations réalisées avec VisionCraft. Chaque ligne est isolée
                par Supabase via la colonne <code>user_id</code>.
              </p>
            </div>
            <div className={styles.projectsToolbar}>
              <label className={styles.searchLabel} htmlFor="project-search">
                Rechercher un prompt
              </label>
              <input
                id="project-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Ex : cyberpunk, aquarelle, portrait…"
                className={styles.searchInput}
              />
              <span className={styles.countPill}>
                {filteredCount} / {totalProjects || 0} projet
                {filteredCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {projectsError && <p className={styles.projectsError}>{projectsError}</p>}

          {projectsLoading ? (
            <div className={styles.projectsGrid}>
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <div key={index} className={styles.skeletonCard}>
                  <div className={styles.skeletonHeader}>
                    <div className={styles.skeletonLineLarge} />
                    <div className={styles.skeletonTag} />
                  </div>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonActions}>
                    <div className={styles.skeletonButton} />
                    <div className={styles.skeletonButton} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCount === 0 ? (
            hasActiveFilter ? (
              <p className={styles.emptyState}>
                Aucun projet ne correspond à « {searchTerm} ». Ajustez votre recherche ou générez une
                nouvelle image.
              </p>
            ) : (
              <p className={styles.emptyState}>
                Aucune transformation pour le moment. Téléversez votre première image ci-dessus pour
                commencer.
              </p>
            )
          ) : (
            <div className={styles.projectsGrid}>
              {filteredProjects.map((project) => {
                const statusLabel =
                  project.status === "completed"
                    ? "Terminé"
                    : project.status === "processing"
                      ? "En cours"
                      : project.status ?? "Inconnu";

                return (
                  <article key={project.id} className={styles.projectCard}>
                    <div className={styles.projectMeta}>
                      <div className={styles.projectMetaRow}>
                        <strong>{project.prompt || "Prompt indisponible"}</strong>
                        <span
                          className={styles.projectStatus}
                          data-status={project.status ?? "unknown"}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <span className={styles.projectDate}>
                        {new Date(project.created_at).toLocaleString("fr-FR")}
                      </span>
                    </div>
                    <div className={styles.projectImages}>
                      {project.input_image_url && (
                        <Image
                          src={project.input_image_url}
                          alt="Image originelle"
                          width={800}
                          height={600}
                          sizes="(max-width: 600px) 100vw, 50vw"
                          className={styles.projectImage}
                        />
                      )}
                      {project.output_image_url && (
                        <Image
                          src={project.output_image_url}
                          alt="Image générée"
                          width={800}
                          height={600}
                          sizes="(max-width: 600px) 100vw, 50vw"
                          className={styles.projectImage}
                        />
                      )}
                    </div>
                    <div className={styles.projectFooter}>
                      <div className={styles.projectLinks}>
                        {project.input_image_url && (
                          <Link
                            href={project.input_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.projectLink}
                          >
                            Original
                          </Link>
                        )}
                        {project.output_image_url && (
                          <Link
                            href={project.output_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.projectLink}
                          >
                            Résultat
                          </Link>
                        )}
                      </div>
                      <div className={styles.projectActions}>
                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(project.id, project.prompt)}
                          className={styles.copyButton}
                        >
                          Copier le prompt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReusePrompt(project.prompt)}
                          className={styles.reuseButton}
                        >
                          Réutiliser
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          className={styles.deleteButton}
                          disabled={Boolean(deletingId) && deletingId === project.id}
                        >
                          {deletingId === project.id ? "Suppression…" : "Supprimer"}
                        </button>
                      </div>
                    </div>
                    {copiedPromptId === project.id && (
                      <p className={styles.copyFeedback}>Prompt copié ✅</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <GithubCallout />
      </section>
    </main>
  );
}
