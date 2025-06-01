import { type NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const photoReference = searchParams.get("photoReference");

  if (!photoReference) {
    return NextResponse.json(
      { error: "photoReference is required" },
      { status: 400 },
    );
  }

  const imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status },
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const contentType = response.headers.get("content-type") ?? "image/jpeg";

    return NextResponse.json({
      imageData: `data:${contentType};base64,${base64Image}`,
      contentType,
    });
  } catch (error) {
    console.error("Error fetching image from Google:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 },
    );
  }
}
