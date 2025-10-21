import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import { supabaseRoute } from "@/lib/supabase-route";
import { getReplicateClient } from "@/lib/replicate";
import { getModelById } from "@/lib/ai-models";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/generate
 * 
 * Génère une image à partir d'un projet payé.
 * Le projet doit avoir payment_status="paid".
 * 
 * Body: { projectId: string }
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer le projectId
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Le projectId est requis" },
        { status: 400 },
      );
    }

    // Récupérer le projet
    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète" },
        { status: 500 },
      );
    }

    const { data: projectData, error: projectError } = await supabaseService
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 },
      );
    }

    const project = projectData as Database["public"]["Tables"]["projects"]["Row"];

    // Vérifier l'appartenance
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 },
      );
    }

    // Vérifier le paiement
    if (project.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Le paiement est requis avant de générer l'image" },
        { status: 402 },
      );
    }

    // Marquer le projet comme "processing"
    await supabaseService
      .from("projects")
      .update({ status: "processing" })
      .eq("id", projectId);

    // Récupérer le modèle IA
    const model = getModelById(project.model_id || "flux-dev");
    if (!model) {
      return NextResponse.json(
        { error: "Modèle IA introuvable" },
        { status: 400 },
      );
    }

    // Appeler Replicate avec l'ID du modèle
    const replicate = getReplicateClient();
    
    let output: any;
    try {
      output = await replicate.run(model.id as any, {
        input: {
          image: project.input_image_url,
          prompt: project.prompt,
        },
      });
    } catch (replicateError: any) {
      console.error("Erreur Replicate:", replicateError);
      
      // Marquer le projet comme failed
      await supabaseService
        .from("projects")
        .update({ 
          status: "failed",
          error_message: replicateError.message || "Erreur lors de la génération"
        })
        .eq("id", projectId);
      
      return NextResponse.json(
        { error: "Erreur lors de la génération de l'image" },
        { status: 500 },
      );
    }

    // Extraire l'URL de sortie
    let outputUrl: string | null = null;
    if (typeof output === "string") {
      outputUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      outputUrl = output[output.length - 1] as string;
    } else if (output && typeof output === "object" && "output" in output) {
      const maybe = (output as Record<string, unknown>).output;
      if (typeof maybe === "string") {
        outputUrl = maybe;
      }
      if (Array.isArray(maybe) && maybe.length > 0) {
        outputUrl = maybe[maybe.length - 1] as string;
      }
    }

    if (!outputUrl) {
      await supabaseService
        .from("projects")
        .update({ 
          status: "failed",
          error_message: "Le modèle n'a pas retourné d'image"
        })
        .eq("id", projectId);
      
      return NextResponse.json(
        { error: "Le modèle n'a pas retourné d'image exploitable" },
        { status: 500 },
      );
    }

    // Télécharger l'image générée
    const generatedResponse = await fetch(outputUrl);
    if (!generatedResponse.ok) {
      throw new Error("Impossible de télécharger l'image générée");
    }

    const generatedBuffer = Buffer.from(await generatedResponse.arrayBuffer());

    // Upload vers Supabase Storage
    const outputPath = `generated/${projectId}-output.png`;
    const { error: uploadError } = await supabaseService.storage
      .from("images")
      .upload(outputPath, generatedBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Erreur upload image générée:", uploadError);
      throw new Error("Erreur lors de l'upload de l'image générée");
    }

    // Récupérer l'URL publique
    const { data: outputPublicData } = supabaseService.storage
      .from("images")
      .getPublicUrl(outputPath);

    // Mettre à jour le projet
    await supabaseService
      .from("projects")
      .update({
        status: "completed",
        generated_image_url: outputPublicData.publicUrl,
      })
      .eq("id", projectId);

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        status: "completed",
        generated_image_url: outputPublicData.publicUrl,
      },
    });
  } catch (error: any) {
    console.error("Erreur /api/generate:", error);
    return NextResponse.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 },
    );
  }
}
