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
import Navigation from "@/components/Navigation";
import CreditsWidget from "@/components/CreditsWidget";
import ModelSelector from "@/components/ModelSelector";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import PageLoader from "@/components/PageLoader";
import { useToast, ToastContainer } from "@/components/Toast";
import { getDefaultModel } from "@/lib/ai-models";
import styles from "./page.module.css";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const DEFAULT_PROMPT = "Rends l'image plus lumineuse et ajoute un style aquarelle";

export default function DashboardPage() {
  const { supabase, user, loading: authLoading } = useAuth();
  const { addToast, success, error: toastError, toasts, removeToast } = useToast();

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
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(getDefaultModel());
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [credits, setCredits] = useState<number>(0);

  const promptLength = prompt.trim().length;
  const isReady = Boolean(file && promptLength > 3);

  // Charger les crédits de l'utilisateur
  useEffect(() => {
    async function loadCredits() {
      if (!user) return;
      
      try {
        const response = await fetch("/api/credits", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des crédits:", error);
      }
    }
    
    loadCredits();
  }, [user]);

  // Vérifier si on revient d'un paiement réussi
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    
    if (sessionId && user) {
      // Vérifier si on a un projet en attente avec ce session_id
      checkPendingProject(sessionId);
    }
  }, [user]);

  async function checkPendingProject(sessionId: string) {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("stripe_checkout_session_id", sessionId)
        .eq("payment_status", "paid");

      if (projects && projects.length > 0) {
        const project = projects[0] as Project;
        setPendingProjectId(project.id);
        success("✅ Paiement confirmé ! Vous pouvez maintenant lancer la génération.");
        
        // Nettoyer l'URL
        window.history.replaceState({}, "", "/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du projet:", error);
      toastError("Erreur lors de la vérification du paiement");
    }
  }

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

  async function handleLaunchGeneration() {
    if (!pendingProjectId || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Étape 3/4 — récupération des données…");
    setGeneratedUrl(null);

    try {
      // Récupérer l'image et le prompt du localStorage
      const pendingData = localStorage.getItem(`pending_project_${pendingProjectId}`);
      if (!pendingData) {
        throw new Error("Données du projet introuvables. Veuillez recommencer.");
      }

      const { imageData, imageName, imageType, prompt: savedPrompt } = JSON.parse(pendingData);

      // Convertir l'image base64 en File
      const response = await fetch(imageData);
      const blob = await response.blob();
      const imageFile = new File([blob], imageName, { type: imageType });

      const body = new FormData();
      body.append("projectId", pendingProjectId);
      body.append("image", imageFile);
      body.append("prompt", savedPrompt);

      setStatus("Étape 4/4 — génération IA en cours…");
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        body,
        credentials: "include",
      });

      if (!generateResponse.ok) {
        const payload = (await generateResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Une erreur est survenue.");
      }

      const data = (await generateResponse.json()) as { outputUrl: string };
      setGeneratedUrl(data.outputUrl);
      setStatus("Génération terminée ✔️");
      success("✨ Image générée avec succès !");
      
      // Nettoyer le localStorage
      localStorage.removeItem(`pending_project_${pendingProjectId}`);
      setPendingProjectId(null);
      
      await loadProjects();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de générer l'image.";
      setError(message);
      setStatus("Échec de la génération.");
      toastError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyPrompt(projectId: string, projectPrompt: string | null) {
    if (!projectPrompt) {
      return;
    }

    try {
      setProjectsError(null);
      await navigator.clipboard.writeText(projectPrompt);
      success("Prompt copié dans le presse-papiers ✅");
      setCopiedPromptId(projectId);
    } catch (copyError) {
      console.error("Erreur lors de la copie du prompt", copyError);
      toastError("Impossible de copier le prompt sur cet appareil.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !isReady || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Étape 1/4 — création du projet…");
    setGeneratedUrl(null);

    try {
      // Créer un projet en attente de paiement
      const projectId = crypto.randomUUID();
      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          id: projectId,
          input_image_url: "", // Sera rempli après le paiement
          prompt,
          status: "pending",
          user_id: user?.id,
          payment_status: "pending",
          payment_amount: 2.0,
        } as any);

      if (insertError) {
        throw new Error(insertError.message);
      }

      setStatus("Étape 2/4 — redirection vers le paiement…");

      // Créer une session de paiement Stripe
      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ projectId }),
      });

      if (!checkoutResponse.ok) {
        const payload = (await checkoutResponse.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Impossible de créer la session de paiement.");
      }

      const { url } = (await checkoutResponse.json()) as { url: string };

      // Sauvegarder temporairement l'image et le prompt dans le localStorage
      // pour pouvoir les récupérer après le retour du paiement
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        localStorage.setItem(`pending_project_${projectId}`, JSON.stringify({
          imageData,
          imageName: file.name,
          imageType: file.type,
          prompt,
        }));
        
        // Rediriger vers Stripe Checkout
        window.location.href = url;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de créer le projet.";
      setError(message);
      setStatus("Échec de la création du projet.");
      setLoading(false);
    }
  }

  async function handleDelete(projectId: string) {
    setDeletingId(projectId);
    setProjectsError(null);

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
      success("Projet supprimé avec succès ✔️");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "La suppression du projet a échoué.";
      setProjectsError(message);
      toastError(message);
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return <PageLoader message="Chargement de votre espace sécurisé..." />;
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
    <>
      <Navigation />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <main className={styles.main}>
        <section className={styles.container}>
          {/* Widget de crédits en haut à droite */}
          <div className="fixed top-20 right-6 z-40">
            <CreditsWidget onBuyClick={() => setShowBuyCreditsModal(true)} />
          </div>

          <header className={styles.hero}>
            <AccentPill>Bienvenue {user.email}</AccentPill>
            <h1 className={styles.title}>Créez, versionnez et partagez vos images IA.</h1>
            <p className={styles.subtitle}>
              Téléversez un visuel, décrivez la transformation désirée et retrouvez toutes vos
              productions dans votre espace personnel. Chaque projet est isolé grâce à Supabase.
            </p>
          </header>

          {/* Sélecteur de modèle IA */}
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

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
                {pendingProjectId ? (
                  <button 
                    type="button" 
                    onClick={handleLaunchGeneration} 
                    disabled={loading} 
                    className={styles.submit}
                  >
                    {loading ? "Génération en cours…" : "Lancer la génération"}
                  </button>
                ) : (
                  <button type="submit" disabled={!isReady || loading} className={styles.submit}>
                    {loading ? "Redirection vers le paiement…" : "Générer (2€)"}
                  </button>
                )}
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
              {filteredProjects.map((project, index) => {
                const statusLabel =
                  project.status === "completed"
                    ? "✅ Terminé"
                    : project.status === "processing"
                      ? "⏳ En cours"
                      : project.status ?? "⚠️ Inconnu";

                return (
                  <article 
                    key={project.id} 
                    className={styles.projectCard}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
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
    
    {/* Modal d'achat de crédits */}
    {showBuyCreditsModal && (
      <BuyCreditsModal
        isOpen={showBuyCreditsModal}
        onClose={() => setShowBuyCreditsModal(false)}
        onSuccess={() => {
          setShowBuyCreditsModal(false);
          success("Crédits achetés avec succès !");
        }}
      />
    )}
    </>
  );
}
