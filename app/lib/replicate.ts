import Replicate from "replicate";

const token = process.env.REPLICATE_API_TOKEN;

export function getReplicateClient() {
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN manquant.");
  }

  return new Replicate({ auth: token });
}
