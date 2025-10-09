import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase-admin";
import { supabaseRoute } from "@/lib/supabase-route";
import { getReplicateClient } from "@/lib/replicate";
import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUser = await supabaseRoute();
    const supabaseTyped = supabaseUser as unknown as SupabaseClient<Database, "public">;
    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Impossible de vérifier la session Supabase." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const prompt = (formData.get("prompt") ?? "").toString().trim();

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Aucune image valide n'a été fournie." },
        { status: 400 },
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Veuillez décrire la transformation souhaitée." },
        { status: 400 },
      );
    }

    const supabaseService = getSupabaseServiceClient();
    if (!supabaseService) {
      return NextResponse.json(
        { error: "Configuration Supabase incomplète côté serveur." },
        { status: 500 },
      );
    }

    const inputBucket = process.env.SUPABASE_INPUT_BUCKET ?? "input-images";
    const outputBucket = process.env.SUPABASE_OUTPUT_BUCKET ?? "output-images";
    const projectId = crypto.randomUUID();
    const inputPath = `raw/${projectId}-${image.name.replace(/\s+/g, "-")}`;

    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const uploadInput = await supabaseService.storage
      .from(inputBucket)
      .upload(inputPath, imageBuffer, {
        contentType: image.type || "image/png",
        upsert: false,
      });

    if (uploadInput.error) {
      throw new Error(uploadInput.error.message);
    }

    const { data: inputPublic } = supabaseService.storage
      .from(inputBucket)
      .getPublicUrl(inputPath);

    if (!inputPublic?.publicUrl) {
      throw new Error("Impossible de récupérer l'URL publique de l'image d'origine.");
    }

    const replicate = getReplicateClient();
    const output = await replicate.run("google/nano-banana", {
      input: {
        image: inputPublic.publicUrl,
        prompt,
      },
    });

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
      throw new Error("Le modèle Replicate n'a pas retourné d'image exploitable.");
    }

    const generatedResponse = await fetch(outputUrl);
    if (!generatedResponse.ok) {
      throw new Error("Impossible de télécharger l'image générée.");
    }

    const generatedBuffer = Buffer.from(await generatedResponse.arrayBuffer());
    const outputPath = `generated/${projectId}.png`;

    const uploadOutput = await supabaseService.storage
      .from(outputBucket)
      .upload(outputPath, generatedBuffer, {
        contentType: generatedResponse.headers.get("content-type") ?? "image/png",
        upsert: true,
      });

    if (uploadOutput.error) {
      throw new Error(uploadOutput.error.message);
    }

    const { data: outputPublic } = supabaseService.storage
      .from(outputBucket)
      .getPublicUrl(outputPath);

    if (!outputPublic?.publicUrl) {
      throw new Error("Impossible de récupérer l'URL publique de l'image générée.");
    }

    const { error: insertError } = await supabaseTyped
      .from("projects")
      .insert([
        {
          id: projectId,
          input_image_url: inputPublic.publicUrl,
          output_image_url: outputPublic.publicUrl,
          prompt,
          status: "completed",
          user_id: user.id,
        } satisfies ProjectInsert,
      ]);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({ outputUrl: outputPublic.publicUrl });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Erreur interne";
    const message = /402/.test(rawMessage) || /insufficient credit/i.test(rawMessage)
      ? "Crédits Replicate insuffisants. Ajoutez du crédit sur https://replicate.com/account/billing avant de réessayer."
      : rawMessage;

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
