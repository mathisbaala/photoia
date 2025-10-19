/**
 * Service d'envoi d'emails
 * 
 * Pour production, utiliser SendGrid, Resend, ou Supabase Edge Functions
 * Pour développement, on log les emails
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // En développement, logger l'email
    if (process.env.NODE_ENV === "development") {
      console.log("📧 EMAIL (dev mode):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Body:", options.html);
      return true;
    }

    // En production, utiliser un service d'email
    // Exemple avec SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: options.subject,
      html: options.html,
    });
    */

    // Pour l'instant, on simule l'envoi
    console.log("📧 Email envoyé:", options.subject, "à", options.to);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return false;
  }
}

export function getPaymentFailedEmailTemplate(customerName: string, amount: number, reason?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Échec du paiement</h1>
          </div>
          <div class="content">
            <p>Bonjour ${customerName},</p>
            <p>Nous vous informons que votre paiement de <strong>${amount}€</strong> n'a pas pu être traité.</p>
            ${reason ? `<p><strong>Raison:</strong> ${reason}</p>` : ""}
            <p>Pour continuer à utiliser PhotoIA, veuillez mettre à jour votre moyen de paiement ou réessayer.</p>
            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" class="button">Retourner au dashboard</a>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br>L'équipe PhotoIA</p>
          </div>
          <div class="footer">
            <p>PhotoIA - Transformation d'images par IA</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getSubscriptionCanceledEmailTemplate(customerName: string, endDate: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Annulation d'abonnement confirmée</h1>
          </div>
          <div class="content">
            <p>Bonjour ${customerName},</p>
            <p>Votre abonnement PhotoIA a bien été annulé.</p>
            <p>Vous pourrez continuer à utiliser les services jusqu'au <strong>${endDate}</strong>.</p>
            <p>Après cette date, votre compte passera en mode gratuit et vous ne serez plus facturé.</p>
            <p>Nous sommes désolés de vous voir partir. Si vous avez des retours à nous faire, n'hésitez pas à nous contacter.</p>
            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" class="button">Retourner au dashboard</a>
            <p>Vous pouvez vous réabonner à tout moment depuis votre tableau de bord.</p>
            <p>Cordialement,<br>L'équipe PhotoIA</p>
          </div>
          <div class="footer">
            <p>PhotoIA - Transformation d'images par IA</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getPaymentSucceededEmailTemplate(customerName: string, amount: number, receiptUrl?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Paiement confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${customerName},</p>
            <p>Votre paiement de <strong>${amount}€</strong> a été traité avec succès.</p>
            ${receiptUrl ? `<p><a href="${receiptUrl}" class="button">📄 Télécharger la facture</a></p>` : ""}
            <p>Vous pouvez maintenant utiliser vos crédits pour générer des images.</p>
            <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" class="button">Accéder au dashboard</a>
            <p>Merci d'utiliser PhotoIA !</p>
            <p>Cordialement,<br>L'équipe PhotoIA</p>
          </div>
          <div class="footer">
            <p>PhotoIA - Transformation d'images par IA</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
