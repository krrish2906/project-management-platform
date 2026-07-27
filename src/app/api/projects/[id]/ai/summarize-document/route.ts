import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';

// POST /api/projects/[id]/ai/summarize-document — Generate AI summary of document content
export async function POST(request: NextRequest) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, title } = body;

        if (!content || content.trim().length < 20) {
            return NextResponse.json({ error: 'Document content is too short to summarize' }, { status: 400 });
        }

        const plainText = content
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();

        if (plainText.length < 20) {
            return NextResponse.json({ error: 'Document has too little text content to summarize' }, { status: 400 });
        }

        const ai = getAIClient();
        const model = getAIModel();

        const completion = await ai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: `You are a professional document analyst. Provide a clear, structured executive summary of the following document.

Your summary should include:
- **Overview**: A 1-2 sentence high-level summary
- **Key Points**: The main topics or sections covered (as bullet points)
- **Details**: Important specifics, data, or requirements mentioned
- **Conclusions**: Any conclusions, next steps, or recommendations

Format as clean markdown. Use **bold** for emphasis. Be concise but don't miss critical information. Do NOT include any preamble — start directly with the summary.`
                },
                {
                    role: 'user',
                    content: `${title ? `Document Title: "${title}"\n\n` : ''}Document Content:\n\n${plainText.substring(0, 8000)}`
                }
            ],
            temperature: 0.3,
            max_tokens: 1200,
        });

        const summary = completion.choices[0]?.message?.content || 'Unable to generate summary.';

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error('AI Document Summarize Error:', error);
        return NextResponse.json({
            error: error.message || 'AI document summarization is currently unavailable. Please try again later.'
        }, { status: 503 });
    }
}
