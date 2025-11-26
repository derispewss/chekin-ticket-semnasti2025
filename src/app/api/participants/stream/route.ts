import { getParticipants } from "@/lib/db";
import { NextRequest } from "next/server";

// This endpoint uses Server-Sent Events (SSE) for real-time updates
export async function GET(request: NextRequest) {
    const encoder = new TextEncoder();

    // Create a readable stream for SSE
    const stream = new ReadableStream({
        async start(controller) {
            // Send initial data
            try {
                const participants = await getParticipants();
                const data = `data: ${JSON.stringify(participants)}\n\n`;
                controller.enqueue(encoder.encode(data));
            } catch (error) {
                console.error("Error fetching participants:", error);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to fetch participants" })}\n\n`));
            }

            // Set up polling interval (every 2 seconds)
            // This is a workaround for serverless environments where we can't maintain persistent connections
            const intervalId = setInterval(async () => {
                try {
                    const participants = await getParticipants();
                    const data = `data: ${JSON.stringify(participants)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch (error) {
                    console.error("Error in SSE stream:", error);
                }
            }, 2000); // Poll every 2 seconds

            // Clean up on client disconnect
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
            "X-Accel-Buffering": "no", // Disable buffering for Nginx
        },
    });
}
