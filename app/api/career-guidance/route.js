
import { inngest } from "@/lib/inngest/client";

export async function POST(req) {
    try {
        const { field, message } = await req.json();
        if (!field || !message) {
            return new Response(JSON.stringify({ error: "Missing field or message" }), { status: 400 });
        }

        // Call the Inngest function
        const result = await inngest.send({
            name: "career-guidance/ask",
            data: { field, message },
        });
        // result.data is the Gemini response
        return new Response(JSON.stringify({ response: result.data }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
