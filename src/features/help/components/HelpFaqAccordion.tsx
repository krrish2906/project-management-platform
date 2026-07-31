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
            answer: 'The free plan allows up to 3 users and 1 active project with basic task management features. It is free forever.',
        },
        {
            id: '2',
            question: 'How do I invite members?',
            answer: 'Navigate to the "Teams" tab in your dashboard, click "Invite Member", and enter their email address. They will receive an invitation link.',
        },
        {
            id: '3',
            question: 'What happens to unfinished sprint tasks?',
            answer: 'Unfinished tasks can automatically roll over to the next sprint or return to the backlog, depending on your project settings.',
        },
        {
            id: '4',
            question: 'How do I use AI summaries?',
            answer: 'AI summaries are available on Pro plans. Click the sparkle icon on any long text field or comment thread to generate a concise summary.',
        },
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggle = (idx: number) => {
        setOpenIndex(prev => prev === idx ? null : idx);
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-[24px] leading-8 font-semibold text-[#1b1b24] mb-6">
                Frequently Asked Questions
            </h2>

            <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                    <div className="p-6 text-center text-[#464555] bg-white rounded-lg border border-[#c7c4d8]/60 text-sm">
                        No questions matched your search query.
                    </div>
                ) : (
                    filteredFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <div
                                key={faq.id}
                                className="bg-white border border-[#c7c4d8]/60 rounded-lg overflow-hidden transition-colors"
                            >
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex justify-between items-center p-4 text-left focus:outline-none hover:bg-[#f5f2ff]/60 transition-colors cursor-pointer"
                                >
                                    <span className="text-[14px] leading-5 font-semibold text-[#1b1b24]">
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`material-symbols-outlined text-[#777587] transition-transform duration-300 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    >
                                        expand_more
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="bg-white border-t border-[#c7c4d8]/60 p-4 text-[14px] leading-5 text-[#464555] animate-fade-in">
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
