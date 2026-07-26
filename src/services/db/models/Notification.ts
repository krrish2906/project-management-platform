import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    type: string;
    title: string;
    message: string;
    project?: mongoose.Types.ObjectId;
    task?: mongoose.Types.ObjectId;
    actor?: mongoose.Types.ObjectId;
    read: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Notification must have a recipient'],
    },
    type: {
        type: String,
        required: [true, 'Notification type is required'],
        enum: ['assigned', 'mentioned', 'due_soon', 'status_changed', 'comment', 'sprint_started', 'member_added', 'pinned'],
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
    },
    actor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    read: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
