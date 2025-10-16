-- Migration pour ajouter les colonnes de paiement Stripe
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter les colonnes de paiement à la table projects
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

-- Créer un index sur stripe_checkout_session_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_projects_stripe_checkout_session_id 
ON public.projects(stripe_checkout_session_id);

-- Créer un index sur payment_status pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_projects_payment_status 
ON public.projects(payment_status);

-- Commentaires pour la documentation
COMMENT ON COLUMN public.projects.payment_status IS 'Statut du paiement: pending, paid, failed, refunded';
COMMENT ON COLUMN public.projects.payment_amount IS 'Montant du paiement en euros (ex: 2.00)';
COMMENT ON COLUMN public.projects.stripe_payment_intent_id IS 'ID du Payment Intent Stripe';
COMMENT ON COLUMN public.projects.stripe_checkout_session_id IS 'ID de la session Checkout Stripe';
