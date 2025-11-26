import { getParticipants } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const participants = await getParticipants();
                const data = `data: ${JSON.stringify(participants)}\n\n`;
                controller.enqueue(encoder.encode(data));
            } catch (error) {
                console.error("Error fetching participants:", error);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to fetch participants" })}\n\n`));
            }

            const intervalId = setInterval(async () => {
                try {
                    const participants = await getParticipants();
                    const data = `data: ${JSON.stringify(participants)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch (error) {
                    console.error("Error in SSE stream:", error);
                }
            }, 2000);

            request.signal.addEventListener("abort", () => {
                clearInterval(intervalId);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
