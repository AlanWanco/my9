import { normalizeShareId } from "@/lib/share/id";
import { getShare } from "@/lib/share/storage";
import { createShareImageResponse } from "@/lib/share/shareImage";

export async function handleShareImageRequest(shareIdValue: string) {
  const shareId = normalizeShareId(shareIdValue);
  if (!shareId) {
    return new Response("invalid share id", { status: 400 });
  }

  const share = await getShare(shareId);
  if (!share) {
    return new Response("share not found", { status: 404 });
  }

  return createShareImageResponse({ share });
}
