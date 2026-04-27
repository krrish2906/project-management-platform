import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKanban extends Document {
    name: string;
    project: mongoose.Types.ObjectId;
    columns: {
        id: string;
        title: string;
        order: number;
        taskLimit?: number;
    }[];
    tasks: {
        taskId: mongoose.Types.ObjectId;
        columnId: string;
        order: number;
    }[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const KanbanSchema = new Schema<IKanban>({
    name: {
        type: String,
        required: [true, 'Please provide a kanban board name'],
        trim: true,
        maxlength: [100, 'Kanban board name cannot be more than 100 characters'],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Kanban board must belong to a project'],
        unique: true, // One kanban per project
    },
    columns: [
        {
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
                trim: true,
            },
            order: {
                type: Number,
                required: true,
            },
            taskLimit: {
                type: Number,
            },
        },
    ],
    tasks: [
        {
            taskId: {
                type: Schema.Types.ObjectId,
                ref: 'Task',
                required: true,
            },
            columnId: {
                type: String,
                required: true,
            },
            order: {
                type: Number,
                required: true,
            },
        },
    ],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Kanban board must have a creator'],
    },
}, { timestamps: true });

KanbanSchema.index({ 'tasks.taskId': 1 });

const Kanban: Model<IKanban> = mongoose.models.Kanban || mongoose.model<IKanban>('Kanban', KanbanSchema);

export default Kanban;
