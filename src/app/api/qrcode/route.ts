import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unique = searchParams.get("unique");

  if (!unique) {
    return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
  }

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(unique);
    return NextResponse.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
