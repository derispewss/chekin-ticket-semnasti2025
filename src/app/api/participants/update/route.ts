import { updateParticipant } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { unique, seminar_kit, consumption, heavy_meal, mission_card, name, email } = body;

        if (!unique) {
            return NextResponse.json({ error: "Unique ID is required" }, { status: 400 });
        }

        const updates: any = {};

        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;

        if (seminar_kit !== undefined) {
            updates.seminar_kit = seminar_kit;
        }

        if (consumption !== undefined) {
            updates.consumption = consumption;
        }

        if (heavy_meal !== undefined) {
            updates.heavy_meal = heavy_meal;
        }

        if (mission_card !== undefined) {
            updates.mission_card = mission_card;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        console.log('Updating participant:', unique, 'with updates:', updates);
        const success = await updateParticipant(unique, updates);

        if (!success) {
            console.error('Update failed for participant:', unique);
            return NextResponse.json({ error: "Failed to update participant - participant not found or no changes made" }, { status: 404 });
        }

        console.log('Successfully updated participant:', unique);
        return NextResponse.json({
            message: "Participant updated successfully",
            updates
        });
    } catch (error) {
        console.error("Update participant error:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
