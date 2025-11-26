import { getParticipantByUniqueId, updateParticipant } from "@/lib/db";
import { parseQRPayload, validateQRHash } from "@/lib/qr-security";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { unique } = await request.json();

    if (!unique) {
      return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
    }

    const parsed = parseQRPayload(unique);

    if (!parsed) {
      return NextResponse.json({
        error: "QR Code tidak valid atau sudah kadaluarsa. Silakan minta QR code baru.",
        invalidQR: true
      }, { status: 400 });
    }

    const { uniqueId, hash } = parsed;

    // Check if participant exists
    const participant = await getParticipantByUniqueId(uniqueId);

    if (!participant) {
      return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
    }

    if (!validateQRHash(hash, participant.qr_hash)) {
      return NextResponse.json({
        error: "QR Code tidak valid atau sudah pernah digunakan. Silakan minta QR code baru.",
        invalidQR: true,
        participant: {
          name: participant.name,
          unique: participant.unique
        }
      }, { status: 400 });
    }

    // Check if already checked in
    if (participant.present) {
      return NextResponse.json({
        error: "Peserta sudah melakukan check-in sebelumnya",
        alreadyCheckedIn: true,
        participant: {
          name: participant.name,
          unique: participant.unique
        }
      }, { status: 400 });
    }

    const success = await updateParticipant(uniqueId, {
      present: true,
      qr_hash: null 
    });

    if (!success) {
      return NextResponse.json({ error: "Gagal melakukan check-in" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Check-in berhasil",
      participant: {
        name: participant.name,
        unique: participant.unique
      }
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
