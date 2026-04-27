import mongoose, { Schema, Document, Model } from 'mongoose';

export type SprintStatus = 'planning' | 'active' | 'completed';

export interface ISprint extends Document {
    name: string;
    project: mongoose.Types.ObjectId;
    goal?: string;
    startDate?: Date;
    endDate?: Date;
    status: SprintStatus;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>({
    name: {
        type: String,
        required: [true, 'Sprint name is required'],
        trim: true,
        maxlength: [100, 'Sprint name cannot be more than 100 characters'],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Sprint must belong to a project'],
    },
    goal: {
        type: String,
        trim: true,
        maxlength: [500, 'Sprint goal cannot be more than 500 characters'],
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed'],
        default: 'planning',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sprint must have a creator'],
    },
}, { timestamps: true });

SprintSchema.index({ project: 1, status: 1 });

const Sprint: Model<ISprint> = mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', SprintSchema);

export default Sprint;
