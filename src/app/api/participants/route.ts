import { deleteAllParticipants, deleteParticipant, getParticipants } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const participants = await getParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error("Get participants error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const unique = searchParams.get("unique");
  const all = searchParams.get("all");

  try {
    if (all === "true") {
      await deleteAllParticipants();
      return NextResponse.json({ message: "All participants deleted" });
    }

    if (unique) {
      const success = await deleteParticipant(unique);
      if (success) {
        return NextResponse.json({ message: "Participant deleted" });
      } else {
        return NextResponse.json({ error: "Participant not found" }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Delete participant error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unique ID or all=true required" }, { status: 400 });
}
