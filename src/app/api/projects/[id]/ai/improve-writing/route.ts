import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';
import { checkAIQuota, incrementAIQuota } from '@/lib/aiQuota';

export type PromptType = 'improve' | 'fix_grammar' | 'professional' | 'shorten' | 'custom' | 'expand' | 'simplify' | 'table' | 'bullet_points' | 'action_items' | 'numbered_steps';

const HTML_PRESERVATION_RULE = `
CRITICAL FORMATTING RULES:
1. The input and output support rich text HTML tags (such as <strong>, <em>, <u>, <ul>, <ol>, <li>, <code>, <p>, <a>, <table>, <thead>, <tbody>, <tr>, <th>, <td>).
2. You MUST preserve and properly adapt existing HTML formatting. Do NOT strip tags into raw plain text.
3. If requested to format as a table or list, generate clean HTML <table> or <ul>/<ol> markup.
4. Return ONLY the modified text/HTML snippet. Do NOT include markdown code fences like \`\`\`html or conversational preamble.`;

const SYSTEM_PROMPTS: Record<string, string> = {
    improve: `You are a world-class editor. Polish the text to improve clarity, vocabulary, sentence variety, and flow while keeping the author's voice and intent intact.${HTML_PRESERVATION_RULE}`,
    fix_grammar: `You are an exacting copyeditor. Fix all spelling errors, grammatical mistakes, typos, and punctuation problems. Do NOT alter the style, tone, or word choice unless necessary to correct an error.${HTML_PRESERVATION_RULE}`,
    professional: `You are an executive business writer. Transform the text into formal, authoritative, and crisp business prose suitable for executive stakeholders and official documentation.${HTML_PRESERVATION_RULE}`,
    shorten: `You are a concise editor. Shorten the text by trimming filler, redundancy, and wordiness while strictly preserving all facts, metrics, and key details.${HTML_PRESERVATION_RULE}`,
    expand: `You are a technical document writer. Expand the text with relevant detail, context, and clear explanations while maintaining original intent.${HTML_PRESERVATION_RULE}`,
    simplify: `You are a plain-language communicator. Simplify complex terms and sentence structures to make the content accessible and effortless to read.${HTML_PRESERVATION_RULE}`,
    table: `You are a master data and documentation structurer. Convert the provided text or data into a clean, well-structured HTML table using <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags with meaningful column headers based on the content.${HTML_PRESERVATION_RULE}`,
    bullet_points: `You are an expert document organizer. Convert the provided text into a clean, well-structured, scannable bullet point list using <ul> and <li> tags, highlighting key takeaways with <strong> tags where appropriate.${HTML_PRESERVATION_RULE}`,
    action_items: `You are a project management specialist. Extract all actionable tasks, deliverables, and next steps from the text as a clean checklist using <ul> and <li> tags, emphasizing action verbs in <strong> tags.${HTML_PRESERVATION_RULE}`,
    numbered_steps: `You are a technical documentation specialist. Convert the provided text into sequential, step-by-step numbered instructions using <ol> and <li> tags.${HTML_PRESERVATION_RULE}`,
    custom: `You are an expert document writing assistant. Follow the user's specific instruction carefully, adapting the text to match the surrounding document context.${HTML_PRESERVATION_RULE}`,
};

// POST /api/projects/[id]/ai/improve-writing — Context-aware AI writing assistant
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;

        // AI Quota & Business Plan Check
        const quotaCheck = await checkAIQuota(user.userId, projectId);
        if (!quotaCheck.allowed) {
            return NextResponse.json({ error: quotaCheck.error }, { status: 403 });
        }

        const body = await request.json();
        const { text, promptType = 'improve', customPrompt, documentTitle, surroundingContext } = body;

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'No text provided to improve' }, { status: 400 });
        }

        const systemPrompt = SYSTEM_PROMPTS[promptType] || SYSTEM_PROMPTS.improve;

        // Build context-aware user message
        let userContent = '';
        if (documentTitle) {
            userContent += `DOCUMENT TITLE: "${documentTitle}"\n`;
        }
        if (surroundingContext && surroundingContext.trim()) {
            userContent += `SURROUNDING CONTEXT (for tone & domain alignment):\n"""\n${surroundingContext.trim().substring(0, 1000)}\n"""\n\n`;
        }

        if (promptType === 'custom' && customPrompt) {
            userContent += `USER INSTRUCTION: ${customPrompt}\n\n`;
        }

        userContent += `CONTENT TO EDIT:\n"""\n${text}\n"""`;

        const ai = getAIClient();
        const model = getAIModel();

        const completion = await ai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userContent,
                },
            ],
            temperature: promptType === 'fix_grammar' ? 0.1 : 0.4,
            max_tokens: 2500,
        });

        const rawResult = completion.choices[0]?.message?.content || text;

        // Strip accidental markdown code fence wrapper (e.g. ```html ... ```)
        const cleanedResult = rawResult
            .replace(/^```(?:html)?\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        // Deduct quota only on success
        const quotaResult = await incrementAIQuota(user.userId, projectId);

        return NextResponse.json({
            result: cleanedResult,
            remainingQuota: quotaResult?.remaining ?? quotaCheck.remaining,
            usedAiPrompts: quotaResult?.used ?? ((quotaCheck.used || 0) + 1),
            workspaceId: quotaResult?.workspaceId ?? quotaCheck.workspaceId,
        });
    } catch (error: any) {
        console.error('AI Writing Assistant Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'AI writing assistant is currently unavailable. Please try again later.',
            },
            { status: 503 }
        );
    }
}
