// ========================================
// Shared types for frontend & backend consumption
// ========================================

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer';
    jobTitle?: string;
    department?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMember {
    user: User | string;
    role: 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer';
}

export interface Project {
    _id: string;
    name: string;
    key: string;
    description?: string;
    owner: User | string;
    kanban?: string;
    members: ProjectMember[];
    status: 'active' | 'archived' | 'completed';
    visibility: 'public' | 'private';
    startDate?: string;
    endDate?: string;
    color?: string;
    icon?: string;
    isStarred: boolean;
    taskCounter: number;
    createdAt: string;
    updatedAt: string;
}

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'improvement';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest' | 'critical';
export type IssueStatus = 'backlog' | 'todo' | 'inprogress' | 'review' | 'qa' | 'blocked' | 'done';

export interface Task {
    _id: string;
    key: string;
    title: string;
    description?: string;
    project: Project | string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    labels: string[];
    assignee?: User | null;
    reporter: User | string;
    dueDate?: string;
    storyPoints?: number;
    sprint?: Sprint | string;
    parentTask?: string;
    watchers: (User | string)[];
    order: number;
    comments: number;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    _id: string;
    task: string;
    author: User | string;
    content: string;
    parentComment?: string;
    mentions: (User | string)[];
    edited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Sprint {
    _id: string;
    name: string;
    project: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    status: 'planning' | 'active' | 'completed';
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    _id: string;
    type: string;
    actor: User | string;
    project?: string;
    task?: Task | string;
    metadata: Record<string, any>;
    createdAt: string;
}

export interface AppNotification {
    _id: string;
    recipient: string;
    type: string;
    title: string;
    message: string;
    project?: string;
    task?: string;
    actor?: User | string;
    read: boolean;
    readAt?: string;
    createdAt: string;
}

export type Column = {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
};

// API response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    message: string;
    error: string | null;
}
