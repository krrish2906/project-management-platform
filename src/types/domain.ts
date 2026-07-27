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
    avatar?: string;
    role?: 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer' | string;
    jobTitle?: string;
    department?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMember {
    user: User | string;
    role: 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer' | string;
    starred?: boolean;
}

export interface Project {
    _id: string;
    id?: string;
    name: string;
    key: string;
    description?: string;
    owner: User | string;
    kanban?: string;
    members: ProjectMember[];
    status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'active' | 'archived' | 'completed' | string;
    visibility?: 'public' | 'private' | string;
    startDate?: string;
    endDate?: string;
    color?: string;
    icon?: string;
    isStarred: boolean;
    taskCounter: number;
    createdAt: string;
    updatedAt: string;
}

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'improvement' | 'TASK' | 'BUG' | 'FEATURE';

export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest' | 'critical' | 'LOW' | 'MEDIUM' | 'HIGH';

export type IssueStatus = 'backlog' | 'todo' | 'inprogress' | 'review' | 'qa' | 'blocked' | 'done' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export interface Task {
    _id: string;
    id?: string;
    key: string;
    number?: number;
    title: string;
    description?: string;
    project: Project | string;
    type: IssueType | TaskType;
    status: IssueStatus | TaskStatus;
    priority: IssuePriority | TaskPriority;
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

export interface TaskAttachment {
    _id?: string;
    id: string;
    taskId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedById: string;
    uploadedAt: string;
}

export interface Comment {
    _id: string;
    id?: string;
    task: string | Task;
    author: User | string;
    content: string;
    parentComment?: string | Comment;
    parentCommentId?: string;
    mentions?: (User | string)[];
    edited: boolean;
    editedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Sprint {
    _id: string;
    id?: string;
    name: string;
    project: string | Project;
    goal?: string;
    startDate?: string;
    endDate?: string;
    status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'planning' | 'active' | 'completed' | string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface Activity {
    _id: string;
    id?: string;
    type: string;
    actor: User | string;
    project?: string;
    task?: Task | string;
    metadata: Record<string, any>;
    createdAt: string;
}

export interface AppNotification {
    _id: string;
    id?: string;
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
