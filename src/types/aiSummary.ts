import { z } from 'zod';

export const ChatSummaryDecisionSchema = z.object({
    text: z.string().describe('Exact decision agreed upon by the team'),
    evidence: z.string().optional().describe('Direct quote or citation from the transcript supporting this decision'),
});

export const ChatSummaryActionItemSchema = z.object({
    task: z.string().describe('Clear action item description'),
    owner: z.string().default('Unassigned').describe('Name of the person who volunteered or was explicitly assigned. Unassigned if not specified.'),
    deadline: z.string().nullable().optional().describe('Explicit deadline mentioned in chat, or null if none mentioned'),
    evidence: z.string().optional().describe('Citation from chat showing task assignment'),
});

export const ChatSummaryBlockerSchema = z.object({
    issue: z.string().describe('What is currently preventing progress'),
    impact: z.string().optional().describe('Consequence or blocked dependency as stated in the conversation'),
    evidence: z.string().optional().describe('Citation from transcript'),
});

export const ChatSummaryUpdateSchema = z.object({
    text: z.string().describe('Notable event or progress milestone that occurred'),
    evidence: z.string().optional().describe('Citation from transcript'),
});

export const ChatSummaryOpenQuestionSchema = z.object({
    question: z.string().describe('Important question raised that remains unanswered'),
});

export const ChatSummarySchema = z.object({
    overview: z.string().describe('2-4 sentences covering main topic, major outcome, current state, and key dependency/blocker'),
    currentState: z.string().default('Progressing').describe('Concise textual status (e.g. Progressing, Blocked, Planning)'),
    decisions: z.array(ChatSummaryDecisionSchema).default([]),
    actionItems: z.array(ChatSummaryActionItemSchema).default([]),
    blockers: z.array(ChatSummaryBlockerSchema).default([]),
    updates: z.array(ChatSummaryUpdateSchema).default([]),
    openQuestions: z.array(ChatSummaryOpenQuestionSchema).default([]),
});

export type ChatSummaryDecision = z.infer<typeof ChatSummaryDecisionSchema>;
export type ChatSummaryActionItem = z.infer<typeof ChatSummaryActionItemSchema>;
export type ChatSummaryBlocker = z.infer<typeof ChatSummaryBlockerSchema>;
export type ChatSummaryUpdate = z.infer<typeof ChatSummaryUpdateSchema>;
export type ChatSummaryOpenQuestion = z.infer<typeof ChatSummaryOpenQuestionSchema>;
export type ChatSummaryData = z.infer<typeof ChatSummarySchema>;

export interface DocumentSummaryData {
    tldr: string;
    takeaways: string[];
    actionItems: { task: string; owner?: string; deadline?: string | null }[];
    decisions: string[];
    keyFacts: { label: string; value: string }[];
    documentType?: string;
    metrics?: {
        wordCount: number;
        readingTimeMinutes: number;
        documentType: string;
    };
}
