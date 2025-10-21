-- Migration pour créer la table payments
-- À exécuter dans le SQL Editor de Supabase

-- Créer la table payments pour l'historique des paiements
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL,
  payment_method TEXT,
  description TEXT,
  receipt_url TEXT,
  payment_type TEXT DEFAULT 'generation', -- 'generation', 'credits', 'subscription'
  credits_purchased INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Créer des index pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer_id ON public.payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON public.payments(payment_type);

-- Activer Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique pour voir ses propres paiements
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour insérer ses propres paiements (via webhook uniquement normalement)
DROP POLICY IF EXISTS "Service can insert payments" ON public.payments;
CREATE POLICY "Service can insert payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true); -- Les paiements sont créés par le service via le webhook

-- Politique pour mettre à jour les paiements (via webhook uniquement)
DROP POLICY IF EXISTS "Service can update payments" ON public.payments;
CREATE POLICY "Service can update payments"
  ON public.payments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at_trigger ON public.payments;
CREATE TRIGGER update_payments_updated_at_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_payments_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE public.payments IS 'Historique complet des paiements Stripe';
COMMENT ON COLUMN public.payments.status IS 'Statut du paiement: succeeded, pending, failed, canceled, refunded';
COMMENT ON COLUMN public.payments.payment_type IS 'Type de paiement: generation (à l''unité), credits (pack), subscription (abonnement)';
COMMENT ON COLUMN public.payments.credits_purchased IS 'Nombre de crédits achetés (si payment_type=credits)';
COMMENT ON COLUMN public.payments.receipt_url IS 'URL de la facture PDF Stripe';
