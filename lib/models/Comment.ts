import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    task: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    parentComment?: mongoose.Types.ObjectId;
    mentions: mongoose.Types.ObjectId[];
    edited: boolean;
    editedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Comment must belong to a task'],
        index: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Comment must have an author'],
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    parentComment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
    mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    edited: {
        type: Boolean,
        default: false,
    },
    editedAt: {
        type: Date,
    },
}, { timestamps: true });

CommentSchema.index({ task: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
