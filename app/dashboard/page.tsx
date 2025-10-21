"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

interface Project {
  id: string;
  name?: string;
  status: "completed" | "processing" | "pending" | "paid";
  input_image_url: string;
  output_image_url?: string;
  prompt: string;
  model_id: string;
  created_at: string;
  amount?: number;
}

type TabType = "generate" | "projects";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>("generate");

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);

  // Generate Form State
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  
  // Loading/Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Projects State
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle Payment Success
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const pendingProjectId = searchParams.get("pending_project");
    
    if (sessionId && pendingProjectId) {
      // Paiement réussi, générer l'image
      router.replace("/dashboard");
      setTimeout(() => handleGenerateAfterPayment(pendingProjectId), 1000);
    }
  }, [searchParams]);

  // Générer après paiement réussi
  const handleGenerateAfterPayment = async (projectId: string) => {
    try {
      setIsLoading(true);
      
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Generation failed");
      }

      await fetchProjects();
      setActiveTab("projects");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  // File Upload Handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
    setError(null);
  }, []);

  // Créer projet et rediriger vers paiement Stripe
  const handleCreateAndPay = async () => {
    if (!file || !prompt.trim()) {
      setError("Veuillez sélectionner une image et entrer un prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Créer le projet
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);
      formData.append("model_id", "batouresearch/magic-image-refiner");

      const createResponse = await fetch("/api/projects", {
        method: "POST",
        body: formData,
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const { project } = await createResponse.json();

      // Créer la session de paiement Stripe
      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          modelId: "batouresearch/magic-image-refiner",
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await checkoutResponse.json();
      
      // Rediriger vers Stripe
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setIsLoading(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Supprimer ce projet ?")) return;

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Erreur lors de la suppression");
    }
  };

  // Filter Projects
  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.welcomeBadge}>
            ✨ Générez vos images IA
          </div>
          <h1 className={styles.title}>
            Dashboard
          </h1>
          <p className={styles.subtitle}>
            Créez des images incroyables avec l'intelligence artificielle
            </p>
          </div>

          {/* Tabs Navigation */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "generate" ? styles.active : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <span className={styles.tabIcon}>✨</span>
              Générer
            </button>
            <button
              className={`${styles.tab} ${activeTab === "projects" ? styles.active : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              <span className={styles.tabIcon}>🎨</span>
              Mes Projets ({projects.length})
            </button>
          </div>

          {/* Generate Tab */}
          {activeTab === "generate" && (
            <div className={styles.generateSection}>
              <div className={styles.row}>
                {/* Upload Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Image source</h2>
                  <p className={styles.cardDescription}>
                    Importez votre image de base
                  </p>

                  <label
                    className={`${styles.uploadZone} ${
                      filePreview ? styles.uploadZoneFilled : ""
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                      disabled={isLoading}
                    />

                    {filePreview ? (
                      <div className={styles.uploadPreview}>
                        <Image
                          src={filePreview}
                          alt="Preview"
                          fill
                          className={styles.uploadImage}
                        />
                        <div className={styles.uploadOverlay}>
                          <span className={styles.uploadText}>
                            Changer l'image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <div className={styles.uploadIcon}>📷</div>
                        <p className={styles.uploadText}>
                          Cliquez ou glissez une image
                        </p>
                        <p className={styles.uploadHint}>
                          PNG, JPG jusqu'à 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Prompt Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Votre prompt</h2>
                  <p className={styles.cardDescription}>
                    Décrivez la transformation souhaitée
                  </p>

                  <textarea
                    className={styles.textarea}
                    placeholder="Ex: Transforme cette photo en style Van Gogh avec des couleurs vibrantes..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    disabled={isLoading}
                  />

                  {error && (
                    <div className={styles.error}>
                      <span className={styles.errorIcon}>⚠️</span>
                      {error}
                    </div>
                  )}

                  <button
                    className={styles.buttonPrimary}
                    onClick={handleCreateAndPay}
                    disabled={isLoading || !file || !prompt.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <span>💳</span>
                        Payer et Générer
                      </>
                    )}
                  </button>
                  
                  <p className={styles.priceInfo}>
                    3€ par génération
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className={styles.projectsSection}>
              {/* Search Bar */}
              <div className={styles.searchBar}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Projects Grid */}
              {isLoadingProjects ? (
                <div className={styles.projectsGrid}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <div className={styles.skeletonImage}></div>
                      <div className={styles.skeletonText}></div>
                      <div className={styles.skeletonText}></div>
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎨</div>
                  <h3 className={styles.emptyTitle}>
                    {searchQuery ? "Aucun résultat" : "Aucun projet"}
                  </h3>
                  <p className={styles.emptyText}>
                    {searchQuery
                      ? "Essayez une autre recherche"
                      : "Commencez par générer votre première image"}
                  </p>
                  {!searchQuery && (
                    <button
                      className={styles.buttonPrimary}
                      onClick={() => setActiveTab("generate")}
                    >
                      Créer un projet
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.projectsGrid}>
                  {filteredProjects.map((project) => (
                    <div key={project.id} className={styles.projectCard}>
                      <div className={styles.projectImage}>
                        <Image
                          src={project.output_image_url || project.input_image_url}
                          alt={project.name || "Projet"}
                          fill
                          className={styles.projectImg}
                        />
                        <div className={styles.projectOverlay}>
                          <span className={`${styles.projectStatus} ${styles[project.status]}`}>
                            {project.status === "completed" && "✓ Complété"}
                            {project.status === "processing" && "⏳ En cours"}
                            {project.status === "pending" && "⏸ En attente"}
                            {project.status === "paid" && "💳 Payé"}
                          </span>
                        </div>
                      </div>

                      <div className={styles.projectContent}>
                        <h3 className={styles.projectName}>{project.name || "Sans titre"}</h3>
                        <p className={styles.projectPrompt}>{project.prompt}</p>
                        
                        {project.amount && (
                          <p className={styles.projectPrice}>
                            Payé : {(project.amount / 100).toFixed(2)}€
                          </p>
                        )}
                        
                        <div className={styles.projectActions}>
                          {project.status === "completed" && project.output_image_url && (
                            <a
                              href={project.output_image_url}
                              download
                              className={styles.projectButton}
                            >
                              <span>⬇️</span>
                              Télécharger
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className={styles.projectButtonDanger}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Chargement...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
