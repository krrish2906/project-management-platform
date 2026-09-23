'use client';

import React from 'react';

interface DocumentMetricsProps {
    wordCount?: number;
    readingTimeMinutes?: number;
    documentType?: string;
}

export function DocumentMetrics({ wordCount, readingTimeMinutes, documentType }: DocumentMetricsProps) {
    const parts: string[] = [];
    if (wordCount !== undefined && wordCount > 0) {
        parts.push(`${wordCount} words`);
    }
    if (readingTimeMinutes !== undefined && readingTimeMinutes > 0) {
        parts.push(`${readingTimeMinutes} min read`);
    }
    if (documentType) {
        parts.push(documentType);
    }

    if (parts.length === 0) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-normal">
            {parts.map((p, idx) => (
                <React.Fragment key={idx}>
                    <span>{p}</span>
                    {idx < parts.length - 1 && <span>·</span>}
                </React.Fragment>
            ))}
        </div>
    );
}
