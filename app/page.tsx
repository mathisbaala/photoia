"use client";

import { ChangeEvent, DragEvent, FormEvent, useState } from "react";
import { AccentPill } from "@/components/AccentPill";
import { FeatureList } from "@/components/FeatureList";
import { GithubCallout } from "@/components/GithubCallout";
import { PreviewImage, PreviewPanel, PreviewPlaceholder } from "@/components/PreviewPanel";
import { UploadCloudIcon } from "@/components/icons";
import { features } from "@/content/features";
import styles from "./page.module.css";

const DEFAULT_PROMPT = "Rends l'image plus lumineuse et ajoute un style aquarelle";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [preview, setPreview] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setDragging] = useState(false);

  const promptLength = prompt.trim().length;
  const isReady = Boolean(file && promptLength > 3);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !isReady) {
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Téléversement & génération en cours…");
    setGeneratedUrl(null);

    try {
      const body = new FormData();
      body.append("image", file);
      body.append("prompt", prompt);

      const response = await fetch("/api/generate", {
        method: "POST",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Une erreur est survenue.");
      }

      const data = (await response.json()) as { outputUrl: string };
      setGeneratedUrl(data.outputUrl);
      setStatus("Génération terminée ✔️");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible de générer l'image.";
      setError(message);
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  const dropzoneClassName = [
    styles.dropzone,
    isDragging ? styles.dropzoneActive : "",
    file ? styles.dropzoneFilled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={styles.main}>
      <section className={styles.container}>
        <header className={styles.hero}>
          <AccentPill>VisionCraft Studio</AccentPill>
          <h1 className={styles.title}>Donnez des super-pouvoirs à vos visuels grâce à notre éditeur IA.</h1>
          <p className={styles.subtitle}>
            Téléversez un visuel, décrivez la transformation désirée et laissez notre moteur génératif s’occuper du reste.
            Les originaux comme les créations finales sont automatiquement versionnés dans vos projets Supabase.
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
            <div className={styles.previewCard}>
              <PreviewPanel title="Aperçu original">
                {preview ? (
                  <PreviewImage src={preview} alt="Aperçu de l'image importée" />
                ) : (
                  <PreviewPlaceholder>Aucune image sélectionnée pour le moment.</PreviewPlaceholder>
                )}
              </PreviewPanel>
            </div>

            <div className={styles.previewCard}>
              <PreviewPanel title="Résultat généré">
                {generatedUrl ? (
                  <PreviewImage src={generatedUrl} alt="Image générée par l'IA" />
                ) : (
                  <PreviewPlaceholder>
                    Lancez une génération pour découvrir le rendu IA.
                  </PreviewPlaceholder>
                )}
              </PreviewPanel>
              {generatedUrl && (
                <div className={styles.previewActions}>
                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.download}
                  >
                    Télécharger l’image
                  </a>
                </div>
              )}
            </div>
          </div>
        </form>

        <section className={styles.featureSection}>
          <FeatureList items={features} />
        </section>

        <section className={styles.systemSection}>
          <GithubCallout />
        </section>
      </section>
    </main>
  );
}
