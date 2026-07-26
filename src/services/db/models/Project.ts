import mongoose, { Schema, Document, Model } from 'mongoose';

export type ProjectMemberRole = 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer';

export interface IProject extends Document {
    name: string;
    key: string;
    description?: string;
    owner: mongoose.Types.ObjectId;
    kanban: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: ProjectMemberRole;
    }[];
    status: 'active' | 'archived' | 'completed';
    visibility: 'public' | 'private';
    startDate?: Date;
    endDate?: Date;
    color?: string;
    icon?: string;
    isStarred: boolean;
    taskCounter: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    name: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true,
        maxlength: [100, 'Project name cannot be more than 100 characters'],
    },
    key: {
        type: String,
        required: [true, 'Please provide a project key'],
        uppercase: true,
        trim: true,
        maxlength: [10, 'Project key cannot be more than 10 characters'],
        match: [/^[A-Z][A-Z0-9]*$/, 'Project key must start with a letter and contain only uppercase letters and numbers'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project must have an owner'],
    },
    kanban: {
        type: Schema.Types.ObjectId,
        ref: 'Kanban',
    },
    members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            role: {
                type: String,
                enum: ['owner', 'admin', 'project_manager', 'developer', 'viewer'],
                default: 'developer',
            },
        },
    ],
    status: {
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active',
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private',
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    color: {
        type: String,
        default: '#3b82f6',
    },
    icon: {
        type: String,
        default: null,
    },
    isStarred: {
        type: Boolean,
        default: false,
    },
    taskCounter: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ 'members.user': 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ key: 1 }, { unique: true });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
