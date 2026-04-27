import mongoose, { Schema, Document, Model } from 'mongoose';

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'improvement';
export type IssuePriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest' | 'critical';
export type IssueStatus = 'backlog' | 'todo' | 'inprogress' | 'review' | 'qa' | 'blocked' | 'done';

export interface ITask extends Document {
    key: string;
    title: string;
    description?: string;
    project: mongoose.Types.ObjectId;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    labels: string[];
    assignee?: mongoose.Types.ObjectId;
    reporter: mongoose.Types.ObjectId;
    dueDate?: Date;
    storyPoints?: number;
    sprint?: mongoose.Types.ObjectId;
    parentTask?: mongoose.Types.ObjectId;
    watchers: mongoose.Types.ObjectId[];
    order: number;
    comments: number;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
    key: {
        type: String,
        required: [true, 'Issue key is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
        maxlength: [200, 'Task title cannot be more than 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [10000, 'Description cannot be more than 10000 characters'],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Task must belong to a project'],
    },
    type: {
        type: String,
        enum: ['epic', 'story', 'task', 'bug', 'improvement'],
        default: 'task',
    },
    status: {
        type: String,
        enum: ['backlog', 'todo', 'inprogress', 'review', 'qa', 'blocked', 'done'],
        default: 'backlog',
    },
    priority: {
        type: String,
        enum: ['lowest', 'low', 'medium', 'high', 'highest', 'critical'],
        default: 'medium',
    },
    labels: {
        type: [String],
        default: [],
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must have a reporter'],
    },
    dueDate: {
        type: Date,
    },
    storyPoints: {
        type: Number,
        min: 0,
        max: 100,
    },
    sprint: {
        type: Schema.Types.ObjectId,
        ref: 'Sprint',
    },
    parentTask: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
    },
    watchers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    order: {
        type: Number,
        default: 0,
    },
    comments: {
        type: Number,
        default: 0,
    },
    attachments: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ sprint: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ key: 1 }, { unique: true });
TaskSchema.index({ parentTask: 1 });
TaskSchema.index({ type: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
