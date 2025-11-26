import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { generateQRHash, createSecureQRPayload } from "@/lib/qr-security";
import { updateParticipant } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unique = searchParams.get("unique");

  if (!unique) {
    return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
  }

  try {
    const qrHash = generateQRHash(unique);
    await updateParticipant(unique, { qr_hash: qrHash });
    const securePayload = createSecureQRPayload(unique, qrHash);
    const qrCodeDataUrl = await QRCode.toDataURL(securePayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
    });

    return NextResponse.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
