import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';
import { checkAIQuota, incrementAIQuota } from '@/lib/aiQuota';

// POST /api/projects/[id]/ai/summarize-document — Generate AI summary of document content
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        // AI Quota & Business Plan Check (verify before processing)
        const quotaCheck = await checkAIQuota(user.userId, projectId);
        if (!quotaCheck.allowed) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
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

        const wordCount = plainText.split(/\s+/).filter(Boolean).length;
        const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 220));

        const ai = getAIClient();
        const model = getAIModel();

        const completion = await ai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: `You are an executive document analyst for a high-performance productivity platform like Linear/Notion.
Analyze the provided document and produce a structured, high-signal Executive Brief.

Respond with ONLY a valid JSON object matching this schema:
{
  "tldr": "1-3 sentences capturing the core essence, architecture/proposal, and immediate status.",
  "takeaways": [
    "High-impact key takeaway statement 1",
    "High-impact key takeaway statement 2",
    "High-impact key takeaway statement 3"
  ],
  "actionItems": [
    { "task": "Specific action item", "owner": "Owner name if mentioned, otherwise Unassigned", "deadline": "Deadline if mentioned, otherwise null" }
  ],
  "decisions": [
    "Confirmed decision 1",
    "Confirmed decision 2"
  ],
  "keyFacts": [
    { "label": "Technology / Key Domain", "value": "Relevant tech or entity" },
    { "label": "Primary Stakeholder", "value": "Relevant team or person" }
  ],
  "documentType": "Technical | Proposal | Strategy | Specification | Operational | Notes"
}

Do NOT wrap in markdown fences (\`\`\`json). Output raw, parseable JSON only.`
                },
                {
                    role: 'user',
                    content: `${title ? `Document Title: "${title}"\n\n` : ''}Document Content:\n\n${plainText.substring(0, 8000)}`
                }
            ],
            temperature: 0.2,
            max_tokens: 1500,
        });

        const rawContent = completion.choices[0]?.message?.content || '';
        let structuredBrief: any = null;

        try {
            const cleanedJson = rawContent
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            structuredBrief = JSON.parse(cleanedJson);
        } catch (parseErr) {
            console.warn('Failed to parse structured JSON from AI, falling back to basic extraction:', parseErr);
        }

        if (!structuredBrief || typeof structuredBrief !== 'object') {
            structuredBrief = {
                tldr: rawContent || 'No summary available.',
                takeaways: [],
                actionItems: [],
                decisions: [],
                keyFacts: [],
                documentType: 'General',
            };
        }

        // Attach computed document metrics
        structuredBrief.metrics = {
            wordCount,
            readingTimeMinutes,
            documentType: structuredBrief.documentType || 'Technical',
        };

        // Deduct quota only on success
        const quotaResult = await incrementAIQuota(user.userId, projectId);

        return NextResponse.json({
            summary: structuredBrief.tldr,
            structuredBrief,
            remainingQuota: quotaResult?.remaining ?? quotaCheck.remaining,
            usedAiPrompts: quotaResult?.used ?? ((quotaCheck.used || 0) + 1),
            workspaceId: quotaResult?.workspaceId ?? quotaCheck.workspaceId,
        });
    } catch (error: any) {
        console.error('AI Document Summarize Error:', error);
        return NextResponse.json({
            error: error.message || 'AI document summarization is currently unavailable. Please try again later.'
        }, { status: 503 });
    }
}
