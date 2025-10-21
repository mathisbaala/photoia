import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/projects
 * Récupère tous les projets de l'utilisateur connecté
 */
export async function GET() {
  try {
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète" },
        { status: 500 }
      );
    }

    const { data: projects, error: projectsError } = await supabaseService
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("Erreur récupération projets:", projectsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des projets" },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error("Erreur GET /api/projects:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Crée un nouveau projet avec status "pending" (en attente de paiement)
 * 
 * Body (FormData):
 * - file: l'image source
 * - prompt: le prompt de transformation
 * - model_id: l'ID du modèle IA à utiliser
 */
export async function POST(request: Request) {
  try {
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const prompt = formData.get("prompt") as string;
    const modelId = formData.get("model_id") as string;

    if (!file || !prompt) {
      return NextResponse.json(
        { error: "L'image et le prompt sont requis" },
        { status: 400 }
      );
    }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète" },
        { status: 500 }
      );
    }

    // Upload l'image originale vers Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseService.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Erreur upload image:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload de l'image" },
        { status: 500 }
      );
    }

    // Récupérer l'URL publique
    const { data: publicUrlData } = supabaseService.storage
      .from("images")
      .getPublicUrl(fileName);

    // Créer le projet avec status "pending"
    const projectName = `${prompt.substring(0, 30)}...`;

    const { data: project, error: projectError } = await supabaseService
      .from("projects")
      .insert({
        user_id: user.id,
        name: projectName,
        prompt: prompt,
        model_id: modelId || "batouresearch/magic-image-refiner",
        input_image_url: publicUrlData.publicUrl,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (projectError) {
      console.error("Erreur création projet:", projectError);
      return NextResponse.json(
        { error: "Erreur lors de la création du projet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Erreur POST /api/projects:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects?id=xxx
 * Supprime un projet de l'utilisateur
 */
export async function DELETE(request: Request) {
  try {
    const supabaseUser = await supabaseRoute();
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");

    if (!projectId) {
      return NextResponse.json(
        { error: "L'ID du projet est requis" },
        { status: 400 }
      );
    }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète" },
        { status: 500 }
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    const { data: project } = await supabaseService
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Projet introuvable" },
        { status: 404 }
      );
    }

    // Supprimer le projet
    const { error: deleteError } = await supabaseService
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      console.error("Erreur suppression projet:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/projects:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
