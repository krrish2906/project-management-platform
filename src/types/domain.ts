import type {
    User as PrismaUser,
    Workspace as PrismaWorkspace,
    WorkspaceMember as PrismaWorkspaceMember,
    Project as PrismaProject,
    ProjectMember as PrismaProjectMember,
    Sprint as PrismaSprint,
    Task as PrismaTask,
    TaskAttachment as PrismaTaskAttachment,
    Comment as PrismaComment,
    Activity as PrismaActivity,
    Notification as PrismaNotification,
    Message as PrismaMessage,
    AuthProvider,
    Plan,
    WorkspaceRole,
    ProjectRole,
    ProjectStatus,
    TaskType,
    TaskPriority,
    TaskStatus,
    SprintStatus
} from '@prisma/client';

export type {
    PrismaUser,
    PrismaWorkspace,
    PrismaWorkspaceMember,
    PrismaProject,
    PrismaProjectMember,
    PrismaSprint,
    PrismaTask,
    PrismaTaskAttachment,
    PrismaComment,
    PrismaActivity,
    PrismaNotification,
    PrismaMessage,
    AuthProvider,
    Plan,
    WorkspaceRole,
    ProjectRole,
    ProjectStatus,
    TaskType,
    TaskPriority,
    TaskStatus,
    SprintStatus
};

export type WorkspaceDTO = PrismaWorkspace & { _id?: string; role?: string };
export type Workspace = WorkspaceDTO;

export interface User {
    _id: string;
    id?: string;
    name: string;
    email: string;
    password?: string;
    avatar?: string | null;
    bio?: string | null;
    department?: string | null;
    jobTitle?: string | null;
    location?: string | null;
    phoneNumber?: string | null;
    googleId?: string | null;
    authProvider?: AuthProvider | null;
    isSuperAdmin?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface TaskAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: User;
    uploadedAt: Date | string;
}

export interface Comment {
    id: string;
    taskId: string;
    author: User;
    content: string;
    parentCommentId?: string | null;
    edited: boolean;
    editedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    replies?: Comment[];
}

export interface Task {
    id: string;
    projectId: string;
    sprintId?: string | null;
    number: number;
    title: string;
    description?: string | null;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    order: number;
    dueDate?: Date | string | null;
    assignee?: User | null;
    reporter: User;
    attachments?: TaskAttachment[];
    comments?: Comment[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Sprint {
    id: string;
    projectId: string;
    name: string;
    goal?: string | null;
    status: SprintStatus;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    tasks?: Task[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Project {
    id: string;
    workspaceId: string;
    ownerId: string;
    name: string;
    key: string;
    description?: string | null;
    status: ProjectStatus;
    color: string;
    icon?: string | null;
    taskCounter: number;
    members?: ProjectMember[];
    sprints?: Sprint[];
    tasks?: Task[];
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: ProjectRole;
    starred: boolean;
    joinedAt: Date | string;
    user?: User;
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: WorkspaceRole;
    joinedAt: Date | string;
    user?: User;
}

export interface Activity {
    id: string;
    workspaceId?: string | null;
    projectId?: string | null;
    taskId?: string | null;
    actor: User;
    type: string;
    metadata?: Record<string, any> | null;
    createdAt: Date | string;
}

export interface Notification {
    id: string;
    recipientId: string;
    actor?: User | null;
    type: string;
    title: string;
    message: string;
    read: boolean;
    readAt?: Date | string | null;
    createdAt: Date | string;
}

export interface ChatMessage {
    id: string;
    projectId: string;
    senderId: string;
    content: string;
    type: string;
    pinned?: boolean;
    attachments?: any;
    replyToId?: string | null;
    replyToContent?: string | null;
    replyToAuthor?: string | null;
    createdAt: Date | string;
    sender?: User;
}
