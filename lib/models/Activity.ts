import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
    type: string;
    actor: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    task?: mongoose.Types.ObjectId;
    metadata: Record<string, any>;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    type: {
        type: String,
        required: [true, 'Activity type is required'],
        enum: [
            'project_created', 'project_updated', 'project_archived',
            'task_created', 'task_updated', 'status_changed', 'task_deleted',
            'comment_added', 'comment_updated',
            'member_invited', 'member_removed', 'role_changed',
            'sprint_created', 'sprint_started', 'sprint_completed',
            'assignee_changed', 'priority_changed',
        ],
    },
    actor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Activity must have an actor'],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });

ActivitySchema.index({ project: 1, createdAt: -1 });
ActivitySchema.index({ actor: 1 });
ActivitySchema.index({ task: 1 });

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
