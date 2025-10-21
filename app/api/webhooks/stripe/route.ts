import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import { 
  sendEmail, 
  getPaymentFailedEmailTemplate, 
  getSubscriptionCanceledEmailTemplate,
  getPaymentSucceededEmailTemplate 
} from "@/lib/email";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/webhooks/stripe
 * 
 * Endpoint webhook pour recevoir les événements Stripe.
 * IMPORTANT : Cet endpoint est public et vérifie la signature du webhook.
 * 
 * Configuration du webhook dans Stripe Dashboard :
 * - URL: https://votre-domaine.com/api/webhooks/stripe
 * - Événements à écouter: 
 *   - checkout.session.completed
 *   - payment_intent.payment_failed
 *   - payment_intent.succeeded
 *   - customer.subscription.deleted
 * 
 * Pour le développement local, utilisez Stripe CLI :
 * stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET n'est pas définie.");
    return NextResponse.json(
      { error: "Configuration du webhook Stripe incomplète." },
      { status: 500 },
    );
  }

  try {
    // Récupérer le corps de la requête en tant que texte brut
    const body = await request.text();
    
    // Récupérer la signature Stripe depuis les headers
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Signature Stripe manquante dans les headers.");
      return NextResponse.json(
        { error: "Signature manquante." },
        { status: 400 },
      );
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signature invalide";
      console.error("Erreur de vérification de signature webhook Stripe:", errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 },
      );
    }

    // Traiter les différents événements
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    // Retourner une réponse de succès
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erreur lors du traitement du webhook Stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du webhook." },
      { status: 500 },
    );
  }
}

/**
 * Traite l'événement checkout.session.completed
 * Met à jour le projet avec le statut de paiement "paid"
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const projectId = session.metadata?.project_id;

  if (!projectId) {
    console.error("project_id manquant dans les metadata de la session:", session.id);
    return;
  }

  const supabaseService = getSupabaseServiceClient();
  if (!supabaseService) {
    console.error("Configuration Supabase incomplète côté serveur.");
    return;
  }

  try {
    // Mettre à jour le projet : paiement réussi
    const updateData: any = {
      payment_status: "paid",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string | null,
      status: "pending", // Prêt à être généré
    };

    // Ajouter le montant si disponible
    if (session.amount_total) {
      updateData.payment_amount = session.amount_total / 100; // Convertir centimes en euros
    }

    await supabaseService
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    console.log(`✅ Paiement confirmé pour le projet ${projectId}`);
  } catch (error) {
    console.error("Erreur lors du traitement du paiement:", error);
  }
}

/**
 * Traite l'événement payment_intent.succeeded
 * Enregistre le paiement dans l'historique
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabaseService = getSupabaseServiceClient();
  if (!supabaseService) {
    console.error("Configuration Supabase incomplète côté serveur.");
    return;
  }

  try {
    const stripe = getStripeClient();
    
    // Récupérer les charges pour obtenir le receipt_url
    let receiptUrl: string | null = null;
    if (paymentIntent.latest_charge) {
      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
      receiptUrl = charge.receipt_url;
    }

    // Enregistrer le paiement dans l'historique
    const { error } = await supabaseService
      .from("payments")
      .upsert({
        stripe_payment_intent_id: paymentIntent.id,
        user_id: paymentIntent.metadata.user_id,
        stripe_customer_id: paymentIntent.customer as string | null,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: "succeeded",
        payment_method: paymentIntent.payment_method_types[0],
        description: paymentIntent.description || "Paiement PhotoIA",
        receipt_url: receiptUrl,
        payment_type: paymentIntent.metadata.payment_type || "generation",
        credits_purchased: parseInt(paymentIntent.metadata.credits_purchased || "0"),
        metadata: paymentIntent.metadata,
      }, {
        onConflict: "stripe_payment_intent_id",
      });

    if (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
      return;
    }

    // Récupérer l'email de l'utilisateur
    const { data: userData } = await supabaseService.auth.admin.getUserById(
      paymentIntent.metadata.user_id
    );

    if (userData?.user?.email) {
      await sendEmail({
        to: userData.user.email,
        subject: "✅ Paiement confirmé - PhotoIA",
        html: getPaymentSucceededEmailTemplate(
          userData.user.email.split("@")[0],
          paymentIntent.amount / 100,
          receiptUrl || undefined
        ),
      });
    }

    console.log(`✅ Paiement enregistré: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Erreur lors du traitement du succès de paiement:", error);
  }
}

/**
 * Traite l'événement payment_intent.payment_failed
 * Envoie un email à l'utilisateur
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabaseService = getSupabaseServiceClient();
  if (!supabaseService) {
    console.error("Configuration Supabase incomplète côté serveur.");
    return;
  }

  try {
    // Enregistrer l'échec dans l'historique
    await supabaseService
      .from("payments")
      .upsert({
        stripe_payment_intent_id: paymentIntent.id,
        user_id: paymentIntent.metadata.user_id,
        stripe_customer_id: paymentIntent.customer as string | null,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: "failed",
        payment_method: paymentIntent.payment_method_types[0],
        description: paymentIntent.description || "Paiement PhotoIA",
        payment_type: paymentIntent.metadata.payment_type || "generation",
        metadata: paymentIntent.metadata,
      }, {
        onConflict: "stripe_payment_intent_id",
      });

    // Récupérer l'email de l'utilisateur
    const { data: userData } = await supabaseService.auth.admin.getUserById(
      paymentIntent.metadata.user_id
    );

    if (userData?.user?.email) {
      const failureReason = paymentIntent.last_payment_error?.message || "Carte refusée";
      
      await sendEmail({
        to: userData.user.email,
        subject: "❌ Échec du paiement - PhotoIA",
        html: getPaymentFailedEmailTemplate(
          userData.user.email.split("@")[0],
          paymentIntent.amount / 100,
          failureReason
        ),
      });
    }

    console.log(`❌ Paiement échoué: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Erreur lors du traitement de l'échec de paiement:", error);
  }
}

/**
 * Traite l'événement customer.subscription.deleted
 * Envoie un email de confirmation d'annulation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseService = getSupabaseServiceClient();
  if (!supabaseService) {
    console.error("Configuration Supabase incomplète côté serveur.");
    return;
  }

  try {
    const stripe = getStripeClient();
    
    // Récupérer les infos du customer
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (customer.deleted) {
      console.log("Customer supprimé, impossible d'envoyer l'email");
      return;
    }

    const email = customer.email;
    if (!email) {
      console.log("Pas d'email pour ce customer");
      return;
    }

    // Formater la date de fin
    const subscriptionData = subscription as any; // Type fix for subscription
    const endDate = new Date(subscriptionData.current_period_end * 1000);
    const formattedDate = endDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendEmail({
      to: email,
      subject: "✅ Annulation d'abonnement confirmée - PhotoIA",
      html: getSubscriptionCanceledEmailTemplate(
        email.split("@")[0],
        formattedDate
      ),
    });

    console.log(`✅ Email d'annulation envoyé à ${email}`);
  } catch (error) {
    console.error("Erreur lors du traitement de l'annulation d'abonnement:", error);
  }
}
