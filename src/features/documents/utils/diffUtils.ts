export interface DiffToken {
    text: string;
    type: 'added' | 'removed' | 'unchanged';
}

export interface WordDiffToken {
    text: string;
    type: 'added' | 'removed' | 'unchanged';
}

export interface VisualDiffLine {
    id: string;
    type: 'added' | 'removed' | 'unchanged';
    gutter: '-' | '+' | ' ';
    lineNumOrig?: number;
    lineNumMod?: number;
    tokens: WordDiffToken[];
    rawText: string;
}

export interface VisualSplitDiffRow {
    left?: VisualDiffLine;
    right?: VisualDiffLine;
}

export interface VisualDiffResult {
    unifiedLines: VisualDiffLine[];
    splitRows: VisualSplitDiffRow[];
    stats: {
        addedWords: number;
        removedWords: number;
        addedLines: number;
        removedLines: number;
    };
}

/**
 * Strip HTML tags to convert rich text into readable plain text for diff rendering
 */
export function stripHtmlForDisplay(html: string): string {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<tr[^>]*>/gi, '\n')
        .replace(/<\/td>\s*<td[^>]*>/gi, ' | ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Tokenize string into words, spaces, and punctuation
 */
function tokenizeWords(str: string): string[] {
    return str.match(/\S+|\s+/g) || [];
}

/**
 * Compute intra-line word-level LCS between original and modified line
 */
export function computeIntraLineWordDiff(origText: string, modText: string): {
    origTokens: WordDiffToken[];
    modTokens: WordDiffToken[];
} {
    const a = tokenizeWords(origText);
    const b = tokenizeWords(modText);

    const m = a.length;
    const n = b.length;

    // Safety cap for huge single lines
    if (m * n > 1000000) {
        return {
            origTokens: [{ text: origText, type: 'removed' }],
            modTokens: [{ text: modText, type: 'added' }],
        };
    }

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (a[i] === b[j]) {
                dp[i + 1][j + 1] = dp[i][j] + 1;
            } else {
                dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let i = m;
    let j = n;
    const rawTokens: WordDiffToken[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
            rawTokens.push({ text: a[i - 1], type: 'unchanged' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            rawTokens.push({ text: b[j - 1], type: 'added' });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            rawTokens.push({ text: a[i - 1], type: 'removed' });
            i--;
        }
    }
    rawTokens.reverse();

    const origTokens: WordDiffToken[] = [];
    const modTokens: WordDiffToken[] = [];

    for (const t of rawTokens) {
        if (t.type === 'unchanged') {
            origTokens.push({ text: t.text, type: 'unchanged' });
            modTokens.push({ text: t.text, type: 'unchanged' });
        } else if (t.type === 'removed') {
            origTokens.push({ text: t.text, type: 'removed' });
        } else if (t.type === 'added') {
            modTokens.push({ text: t.text, type: 'added' });
        }
    }

    const mergeTokens = (arr: WordDiffToken[]) => {
        const res: WordDiffToken[] = [];
        for (const token of arr) {
            const prev = res[res.length - 1];
            if (prev && prev.type === token.type) {
                prev.text += token.text;
            } else {
                res.push({ ...token });
            }
        }
        return res;
    };

    return {
        origTokens: mergeTokens(origTokens),
        modTokens: mergeTokens(modTokens),
    };
}

/**
 * Word-level diff computation using Longest Common Subsequence (LCS)
 */
export function computeWordDiff(original: string, modified: string): DiffToken[] {
    const origClean = stripHtmlForDisplay(original);
    const modClean = stripHtmlForDisplay(modified);

    if (origClean === modClean) {
        return [{ text: modClean, type: 'unchanged' }];
    }

    const a = tokenizeWords(origClean);
    const b = tokenizeWords(modClean);

    const m = a.length;
    const n = b.length;

    if (m * n > 4000000) {
        return [
            { text: origClean, type: 'removed' },
            { text: modClean, type: 'added' },
        ];
    }

    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (a[i] === b[j]) {
                dp[i + 1][j + 1] = dp[i][j] + 1;
            } else {
                dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let i = m;
    let j = n;
    const tokens: DiffToken[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
            tokens.push({ text: a[i - 1], type: 'unchanged' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            tokens.push({ text: b[j - 1], type: 'added' });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            tokens.push({ text: a[i - 1], type: 'removed' });
            i--;
        }
    }

    tokens.reverse();

    const merged: DiffToken[] = [];
    for (const token of tokens) {
        const prev = merged[merged.length - 1];
        if (prev && prev.type === token.type) {
            prev.text += token.text;
        } else {
            merged.push({ ...token });
        }
    }

    return merged;
}

/**
 * Line and Word-Level Visual Diff Computation
 * Generates both Unified and Split Side-by-Side views with gutter symbols and stats.
 */
export function computeVisualDiff(originalHtml: string, modifiedHtml: string): VisualDiffResult {
    const origClean = stripHtmlForDisplay(originalHtml);
    const modClean = stripHtmlForDisplay(modifiedHtml);

    const aLines = origClean.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const bLines = modClean.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (aLines.length === 0 && bLines.length === 0) {
        return {
            unifiedLines: [],
            splitRows: [],
            stats: { addedWords: 0, removedWords: 0, addedLines: 0, removedLines: 0 },
        };
    }

    // If original was completely empty (e.g. quick draft)
    if (aLines.length === 0) {
        let addedWords = 0;
        const unifiedLines: VisualDiffLine[] = bLines.map((text, idx) => {
            addedWords += text.trim().split(/\s+/).filter(Boolean).length;
            return {
                id: `add-${idx}`,
                type: 'added' as const,
                gutter: '+' as const,
                lineNumMod: idx + 1,
                tokens: [{ text, type: 'added' as const }],
                rawText: text,
            };
        });
        const splitRows: VisualSplitDiffRow[] = unifiedLines.map((line) => ({
            right: line,
        }));
        return {
            unifiedLines,
            splitRows,
            stats: { addedWords, removedWords: 0, addedLines: bLines.length, removedLines: 0 },
        };
    }

    // Line-level LCS matrix
    const m = aLines.length;
    const n = bLines.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (aLines[i].trim() === bLines[j].trim()) {
                dp[i + 1][j + 1] = dp[i][j] + 1;
            } else {
                dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let i = m;
    let j = n;
    type LineOp =
        | { type: 'unchanged'; aIdx: number; bIdx: number }
        | { type: 'added'; bIdx: number }
        | { type: 'removed'; aIdx: number };

    const ops: LineOp[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && aLines[i - 1].trim() === bLines[j - 1].trim()) {
            ops.push({ type: 'unchanged', aIdx: i - 1, bIdx: j - 1 });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            ops.push({ type: 'added', bIdx: j - 1 });
            j--;
        } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
            ops.push({ type: 'removed', aIdx: i - 1 });
            i--;
        }
    }

    ops.reverse();

    const unifiedLines: VisualDiffLine[] = [];
    const splitRows: VisualSplitDiffRow[] = [];
    let addedWords = 0;
    let removedWords = 0;
    let addedLines = 0;
    let removedLines = 0;
    let k = 0;
    let lineOrig = 1;
    let lineMod = 1;

    while (k < ops.length) {
        const op = ops[k];
        if (op.type === 'unchanged') {
            const text = aLines[op.aIdx];
            const line: VisualDiffLine = {
                id: `u-${k}`,
                type: 'unchanged',
                gutter: ' ',
                lineNumOrig: lineOrig++,
                lineNumMod: lineMod++,
                tokens: [{ text, type: 'unchanged' }],
                rawText: text,
            };
            unifiedLines.push(line);
            splitRows.push({ left: line, right: line });
            k++;
        } else {
            const remOps: { aIdx: number }[] = [];
            const addOps: { bIdx: number }[] = [];

            while (k < ops.length && ops[k].type !== 'unchanged') {
                const cur = ops[k];
                if (cur.type === 'removed') remOps.push(cur);
                else if (cur.type === 'added') addOps.push(cur);
                k++;
            }

            const maxLen = Math.max(remOps.length, addOps.length);
            for (let idx = 0; idx < maxLen; idx++) {
                const remOp = remOps[idx];
                const addOp = addOps[idx];
                let leftLine: VisualDiffLine | undefined = undefined;
                let rightLine: VisualDiffLine | undefined = undefined;

                if (remOp && addOp) {
                    const diff = computeIntraLineWordDiff(aLines[remOp.aIdx], bLines[addOp.bIdx]);
                    leftLine = {
                        id: `rem-${remOp.aIdx}`,
                        type: 'removed',
                        gutter: '-',
                        lineNumOrig: lineOrig++,
                        tokens: diff.origTokens,
                        rawText: aLines[remOp.aIdx],
                    };
                    rightLine = {
                        id: `add-${addOp.bIdx}`,
                        type: 'added',
                        gutter: '+',
                        lineNumMod: lineMod++,
                        tokens: diff.modTokens,
                        rawText: bLines[addOp.bIdx],
                    };
                    removedLines++;
                    addedLines++;
                    diff.origTokens.forEach((t) => {
                        if (t.type === 'removed') {
                            removedWords += t.text.trim().split(/\s+/).filter(Boolean).length;
                        }
                    });
                    diff.modTokens.forEach((t) => {
                        if (t.type === 'added') {
                            addedWords += t.text.trim().split(/\s+/).filter(Boolean).length;
                        }
                    });
                    unifiedLines.push(leftLine);
                    unifiedLines.push(rightLine);
                } else if (remOp) {
                    const text = aLines[remOp.aIdx];
                    leftLine = {
                        id: `rem-${remOp.aIdx}`,
                        type: 'removed',
                        gutter: '-',
                        lineNumOrig: lineOrig++,
                        tokens: [{ text, type: 'removed' }],
                        rawText: text,
                    };
                    removedLines++;
                    removedWords += text.trim().split(/\s+/).filter(Boolean).length;
                    unifiedLines.push(leftLine);
                } else if (addOp) {
                    const text = bLines[addOp.bIdx];
                    rightLine = {
                        id: `add-${addOp.bIdx}`,
                        type: 'added',
                        gutter: '+',
                        lineNumMod: lineMod++,
                        tokens: [{ text, type: 'added' }],
                        rawText: text,
                    };
                    addedLines++;
                    addedWords += text.trim().split(/\s+/).filter(Boolean).length;
                    unifiedLines.push(rightLine);
                }
                splitRows.push({ left: leftLine, right: rightLine });
            }
        }
    }

    return {
        unifiedLines,
        splitRows,
        stats: { addedWords, removedWords, addedLines, removedLines },
    };
}

// Aliases for convenience
export const computeDetailedDiff = computeVisualDiff;
export type DiffLine = VisualDiffLine;
export type SplitDiffRow = VisualSplitDiffRow;
export type DiffResult = VisualDiffResult;

