'use client'

import React, { useState } from 'react';

interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

interface HelpFaqAccordionProps {
    searchQuery: string;
}

export function HelpFaqAccordion({ searchQuery }: HelpFaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FaqItem[] = [
        {
            id: '1',
            question: 'How does the FREE plan work?',
            answer: 'The free plan allows up to 3 projects and 5 members per project with basic task management, real-time chat, 10 AI prompts per month, and 500 MB cloud storage. It is free forever.',
        },
        {
            id: '2',
            question: 'How do I invite members?',
            answer: 'Navigate to the "Workspace Team" tab in your dashboard, click "+ Invite Member", and enter their email address. They will receive an invitation link to join your workspace.',
        },
        {
            id: '3',
            question: 'What happens to unfinished sprint tasks?',
            answer: 'Unfinished tasks can automatically roll over to the next sprint or return to the project backlog, depending on your project sprint settings.',
        },
        {
            id: '4',
            question: 'How do I use AI summaries?',
            answer: 'AI features are available across projects and tasks. Click the sparkle auto-summary icon on any task description or thread to generate a concise status summary.',
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggle = (idx: number) => {
        setOpenIndex((prev) => (prev === idx ? null : idx));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[20px] text-[#4F46E5]">quiz</span>
                <h2 className="text-lg font-bold text-[#0f172a]">
                    Frequently Asked Questions
                </h2>
            </div>

            <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                    <div className="p-8 text-center text-[#64748b] bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs text-xs">
                        No questions matched your search query.
                    </div>
                ) : (
                    filteredFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={faq.id}
                                className={`bg-white border rounded-2xl overflow-hidden shadow-2xs transition-all duration-200 ${
                                    isOpen ? 'border-[#4F46E5]/40 border-l-4 border-l-[#4F46E5] ring-2 ring-[#4F46E5]/5' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                                }`}
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className={`w-full flex justify-between items-center p-4 sm:px-5 sm:py-4 text-left transition-colors cursor-pointer ${
                                        isOpen ? 'bg-[#EEF2FF]/30' : 'hover:bg-[#F8FAFC]'
                                    }`}
                                >
                                    <span className={`text-xs sm:text-sm font-bold pr-2 transition-colors ${isOpen ? 'text-[#4F46E5]' : 'text-[#0f172a]'}`}>
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`material-symbols-outlined text-[20px] transition-transform duration-200 shrink-0 ${
                                            isOpen ? 'rotate-180 text-[#4F46E5]' : 'text-[#94a3b8]'
                                        }`}
                                    >
                                        expand_more
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 text-xs leading-relaxed text-[#475569] border-t border-[#E2E8F0]/60 bg-white">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
