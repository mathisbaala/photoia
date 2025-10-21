-- Migration pour créer la table credits
-- À exécuter dans le SQL Editor de Supabase

-- Créer la table credits pour gérer les packs de crédits
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer un index sur user_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON public.credits(user_id);

-- Créer un index unique pour s'assurer qu'un utilisateur n'a qu'un seul enregistrement de crédits
CREATE UNIQUE INDEX IF NOT EXISTS idx_credits_user_id_unique ON public.credits(user_id);

-- Activer Row Level Security
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres crédits
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
CREATE POLICY "Users can view own credits"
  ON public.credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour insérer ses propres crédits
DROP POLICY IF EXISTS "Users can insert own credits" ON public.credits;
CREATE POLICY "Users can insert own credits"
  ON public.credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour mettre à jour ses propres crédits
DROP POLICY IF EXISTS "Users can update own credits" ON public.credits;
CREATE POLICY "Users can update own credits"
  ON public.credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_credits_updated_at_trigger ON public.credits;
CREATE TRIGGER update_credits_updated_at_trigger
  BEFORE UPDATE ON public.credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credits_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE public.credits IS 'Gère les crédits de génération d''images pour chaque utilisateur';
COMMENT ON COLUMN public.credits.credits_remaining IS 'Nombre de crédits restants pour l''utilisateur';
COMMENT ON COLUMN public.credits.total_purchased IS 'Nombre total de crédits achetés (historique)';
