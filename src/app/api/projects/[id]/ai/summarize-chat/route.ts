import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/services/db/prisma';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';
import { checkAIQuota, incrementAIQuota } from '@/lib/aiQuota';
import { ChatSummarySchema } from '@/types/aiSummary';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        // 1. Check AI Quota (scoped to project workspace, without incrementing yet)
        const quotaCheck = await checkAIQuota(user.userId, projectId);
        if (!quotaCheck.allowed) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }

        // 2. Query last 100 messages from project chatroom
        const messages = await prisma.message.findMany({
            where: { projectId },
            include: {
                sender: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: 'No messages to summarize in this conversation yet.' }, { status: 400 });
        }

        // Count unique participants
        const uniqueParticipants = new Set(messages.map((m) => m.sender?.name || m.sender?.email || m.senderId)).size;

        // Build chronological transcript with timestamps & sender names
        const transcript = messages
            .slice()
            .reverse()
            .map((msg) => {
                const name = msg.sender?.name || msg.sender?.email?.split('@')[0] || 'Unknown';
                const time = new Date(msg.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
                return `[${time}] ${name}: ${msg.content}`;
            })
            .join('\n');

        const ai = getAIClient();
        const model = getAIModel();

        // 3. Call LLM with strict evidence-based JSON mode prompt
        const completion = await ai.chat.completions.create({
            model,
            response_format: { type: 'json_object' },
            messages: [
                {
                    role: 'system',
                    content: `You are an expert project communication analyst. Summarize team chat conversations with extreme precision.
Your goal is to enable any project member to open the summary and instantly understand what happened, what was decided, what needs to be done, and what is currently blocked — without reading the entire transcript.

CRITICAL RULES (EVIDENCE-BASED REPORTING):
1. Only report information supported by the transcript.
2. OVERVIEW (2–4 sentences): Must be concrete and high-signal. Answer: "What happened in this conversation?" Include: main topic, major outcome, current state, and key dependency/blocker. NEVER write generic filler like "The team discussed various topics".
3. KEY DECISIONS: Include an item ONLY when the conversation contains explicit evidence that the team agreed on it. Do NOT infer agreement from a suggestion or discussion (e.g. if someone says "Should we use PostgreSQL?" and another says "Maybe", that is NOT a decision).
4. ACTION ITEMS:
   - Identify concrete tasks discussed.
   - Do NOT invent owners. If someone explicitly volunteered ("I will do X") or was explicitly assigned ("@Rahul please build Y"), set owner to their name. If nobody was explicitly assigned, set owner to "Unassigned".
   - Do NOT invent deadlines. Only include a deadline if explicitly stated (e.g. "by Friday", "end of day"). Otherwise set deadline to null.
5. BLOCKERS: Answer: "What is preventing progress?" Include the impact only if stated or directly implied by dependencies in the conversation.
6. IMPORTANT UPDATES: Milestones or things that occurred/progress made (distinct from decisions).
7. OPEN QUESTIONS: Questions that were raised during discussion but remain unanswered. Distinguish clearly between questions discussed vs. questions answered.
8. CURRENT STATE: A concise 1-sentence description of current momentum (e.g. "Progressing - backend OAuth work underway, frontend awaiting API contract").
9. If any section has no supported information, return an empty array [].

Return ONLY valid JSON matching this exact structure:
{
  "overview": "2-4 sentence concrete overview answering what happened, major outcome, and current state.",
  "currentState": "Concise 1-sentence current state description",
  "decisions": [
    { "text": "Confirmed decision", "evidence": "Direct quote or chat reference" }
  ],
  "actionItems": [
    { "task": "Task description", "owner": "Name or Unassigned", "deadline": "string or null", "evidence": "quote or reference" }
  ],
  "blockers": [
    { "issue": "Blocker description", "impact": "Impact on progress", "evidence": "quote or reference" }
  ],
  "updates": [
    { "text": "Update description", "evidence": "quote or reference" }
  ],
  "openQuestions": [
    { "question": "Question that still needs resolution" }
  ]
}`,
                },
                {
                    role: 'user',
                    content: `Here is the team chat transcript (${messages.length} messages, ${uniqueParticipants} participants):\n\n${transcript}`,
                },
            ],
            temperature: 0.2,
            max_tokens: 1500,
        });

        const rawContent = completion.choices[0]?.message?.content;
        if (!rawContent) {
            throw new Error('AI returned an empty response.');
        }

        // 4. Validate output with Zod schema
        const parsedJson = JSON.parse(rawContent);
        const validatedSummary = ChatSummarySchema.parse(parsedJson);

        // 5. Deduct quota ONLY after successful validation
        const quotaResult = await incrementAIQuota(user.userId, projectId);

        return NextResponse.json({
            success: true,
            summary: validatedSummary,
            messageCount: messages.length,
            participantCount: uniqueParticipants,
            remainingQuota: quotaResult?.remaining ?? quotaCheck.remaining,
            usedAiPrompts: quotaResult?.used ?? ((quotaCheck.used || 0) + 1),
            workspaceId: quotaResult?.workspaceId ?? quotaCheck.workspaceId,
        });
    } catch (error: any) {
        console.error('AI Chat Summarize Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'AI chat summarization is currently unavailable. Please try again later.',
            },
            { status: 503 }
        );
    }
}
