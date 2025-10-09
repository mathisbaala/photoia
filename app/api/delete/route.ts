import { NextResponse } from "next/server";
import { supabaseRoute } from "@/lib/supabase-route";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import type { Database } from "@/lib/database.types";

export const runtime = "nodejs";

type DeletePayload = {
  projectId?: string;
};

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function extractStoragePath(url: string | null, bucket: string) {
  if (!url) {
    return null;
  }

  try {
    const marker = `/object/public/${bucket}/`;
    const index = url.indexOf(marker);
    if (index === -1) {
      return null;
    }
    const encodedPath = url.slice(index + marker.length);
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await supabaseRoute();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Session Supabase invalide." }, { status: 401 });
    }

    const payload = (await request.json().catch(() => null)) as DeletePayload | null;
    const projectId = payload?.projectId;

    if (!projectId) {
      return NextResponse.json({ error: "Identifiant du projet manquant." }, { status: 400 });
    }

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    const project = projectData as ProjectRow | null;

    if (projectError || !project) {
      return NextResponse.json({ error: "Projet introuvable ou inaccessible." }, { status: 404 });
    }

    const service = getSupabaseServiceClient();
    if (!service) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète côté serveur." },
        { status: 500 },
      );
    }

    const inputBucket = process.env.SUPABASE_INPUT_BUCKET ?? "input-images";
    const outputBucket = process.env.SUPABASE_OUTPUT_BUCKET ?? "output-images";

    const inputPath = extractStoragePath(project.input_image_url, inputBucket);
    const outputPath = extractStoragePath(project.output_image_url, outputBucket);

    if (inputPath) {
      await service.storage.from(inputBucket).remove([inputPath]);
    }

    if (outputPath) {
      await service.storage.from(outputBucket).remove([outputPath]);
    }

    const { error: deleteError } = await supabase.from("projects").delete().eq("id", projectId);
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de supprimer le projet demandé.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
