import type { ReactNode } from "react";

export type FeatureItem = {
  title: string;
  description: ReactNode;
};

export const features: FeatureItem[] = [
  {
    title: "Upload sécurisé",
    description: (
      <>
        Les originaux sont stockés dans le bucket <code>input-images</code> et restent accessibles pour vos itérations.
      </>
    ),
  },
  {
    title: "Modèle Replicate optimisé",
    description: (
      <>
        Nous exploitons <code>google/nano-banana</code> pour un rendu rapide tout en conservant la structure du visuel initial.
      </>
    ),
  },
  {
    title: "Historique granulaire",
    description: (
      <>
        Chaque projet est journalisé dans la table <code>projects</code> avec statut, prompt et URLs des images générées.
      </>
    ),
  },
  {
    title: "CI GitHub prête",
    description: (
      <>
        Un workflow GitHub Actions lint, typecheck et build chaque branche pour sécuriser les merges sans surprises.
      </>
    ),
  },
  {
    title: "Interface guidée",
    description: (
      <>
        Zone de dépôt animée, compteur de prompt et téléchargement du rendu facilitent l’onboarding des créatifs.
      </>
    ),
  },
];
