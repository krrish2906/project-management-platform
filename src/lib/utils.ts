import { formatDistanceToNow, format } from 'date-fns';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date | undefined, formatStr: string = 'MMM dd, yyyy'): string {
    if (!date) return 'N/A';
    try {
        return format(new Date(date), formatStr);
    } catch {
        return 'N/A';
    }
}

export function formatRelativeTime(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
        return 'N/A';
    }
}

export function getUserInitials(name: string | undefined): string {
    if (!name) return '??';
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
