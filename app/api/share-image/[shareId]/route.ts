import { handleShareImageRequest } from "@/lib/share/imageRoute";

export const runtime = "edge";

export async function GET(
  _request: Request,
  context: { params: { shareId: string } }
) {
  return handleShareImageRequest(context.params.shareId);
}
