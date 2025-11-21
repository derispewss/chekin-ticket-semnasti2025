import { getParticipantByUniqueId, updateParticipant } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { unique } = await request.json();

    if (!unique) {
      return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
    }

    // Check if participant exists
    const participant = await getParticipantByUniqueId(unique);

    if (!participant) {
      return NextResponse.json({ error: "Peserta tidak ditemukan" }, { status: 404 });
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

    // Perform check-in
    const success = await updateParticipant(unique, { present: true });

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
