import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import getAIClient, { getAIModel } from '@/services/ai/ai';

type PromptType = 'improve' | 'fix_grammar' | 'professional' | 'expand' | 'simplify' | 'shorten';

const SYSTEM_PROMPTS: Record<PromptType, string> = {
    improve: `You are a skilled editor. Improve the following text to be clearer, more engaging, and better structured. Preserve the original meaning and tone. Return ONLY the improved text, no explanations.`,
    fix_grammar: `You are a proofreader. Fix all spelling, grammar, and punctuation errors in the following text. Do NOT change the meaning or style — only correct mistakes. Return ONLY the corrected text, no explanations.`,
    professional: `You are a business writing expert. Rewrite the following text in a professional, formal tone suitable for business documentation. Return ONLY the rewritten text, no explanations.`,
    expand: `You are a thorough technical writer. Expand the following text with more detail, examples, and context while maintaining the original intent. Make it approximately 2-3x longer. Return ONLY the expanded text, no explanations.`,
    simplify: `You are a plain-language expert. Simplify the following text to be easily understood by anyone. Use shorter sentences and simpler words. Return ONLY the simplified text, no explanations.`,
    shorten: `You are a concise editor. Shorten the following text to be as brief as possible while preserving all key information. Return ONLY the shortened text, no explanations.`,
};

// POST /api/projects/[id]/ai/improve-writing — AI writing assistant
export async function POST(request: NextRequest) {
    try {
        const user = getAuthUser(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, promptType } = body;

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        if (!promptType || !SYSTEM_PROMPTS[promptType as PromptType]) {
            return NextResponse.json({
                error: 'Invalid prompt type'
            }, { status: 400 });
        }

        const ai = getAIClient();
        const model = getAIModel();

        const completion = await ai.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPTS[promptType as PromptType],
                },
                {
                    role: 'user',
                    content: text,
                }
            ],
            temperature: promptType === 'fix_grammar' ? 0.1 : 0.5,
            max_tokens: 2000,
        });

        const result = completion.choices[0]?.message?.content || text;

        return NextResponse.json({ result });

    } catch (error: any) {
        console.error('AI Writing Improve Error:', error);
        return NextResponse.json({
            error: error.message || 'AI writing assistant is currently unavailable. Please try again later.'
        }, { status: 503 });
    }
}
