import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/services/db/mongodb';
import Message from '@/services/db/models/Message';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';

// POST /api/projects/[id]/ai/summarize-chat — Generate AI summary of recent chat
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        await connectDB();

        // Fetch the last 100 messages for context
        const messages = await Message.find({ project: projectId })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('sender', 'name')
            .lean();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages to summarize' }, { status: 400 });
        }

        // Reverse to chronological order and format as a transcript
        const transcript = messages
            .reverse()
            .filter((msg: any) => msg.type !== 'system')
            .map((msg: any) => {
                const name = msg.sender?.name || 'Unknown';
                const time = new Date(msg.createdAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                return `[${time}] ${name}: ${msg.content}`;
            })
            .join('\n');

        const ai = getAIClient();
        const model = getAIModel();

        const completion = await ai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: `You are a concise project assistant. Summarize the following team chat conversation. 
Focus on:
- Key decisions made
- Action items discussed
- Important updates or announcements
- Any blockers or issues raised

Format as clean markdown with bullet points. Use **bold** for key terms. Keep it concise but comprehensive. Do NOT include any preamble — start directly with the summary content.`
                },
                {
                    role: 'user',
                    content: `Here is the team chat transcript (${messages.length} messages):\n\n${transcript}`
                }
            ],
            temperature: 0.3,
            max_tokens: 1000,
        });

        const summary = completion.choices[0]?.message?.content || 'Unable to generate summary.';

        return NextResponse.json({ summary, messageCount: messages.length });
    } catch (error: any) {
        console.error('AI Chat Summarize Error:', error);
        if (error.message?.includes('AI_API_KEY')) {
            return NextResponse.json({ error: 'AI is not configured. Please set AI_API_KEY in your environment.' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
    }
}
