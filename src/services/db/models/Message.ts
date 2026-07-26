import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    project: mongoose.Types.ObjectId | string;
    sender: mongoose.Types.ObjectId;
    content: string;
    type: 'text' | 'file' | 'system';
    attachments?: {
        url: string;
        filename: string;
        mimetype: string;
        size: number;
    }[];
    pinned: boolean;
    edited: boolean;
    editedAt?: Date;
    readBy: {
        user: mongoose.Types.ObjectId;
        readAt: Date;
    }[];
    reactions?: {
        emoji: string;
        users: mongoose.Types.ObjectId[];
    }[];
    replyTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        project: {
            type: Schema.Types.Mixed,
            ref: 'Project',
            required: [true, 'Message must belong to a project'],
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Message must have a sender'],
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
            maxlength: [5000, 'Message cannot exceed 5000 characters'],
        },
        type: {
            type: String,
            enum: ['text', 'file', 'system'],
            default: 'text',
        },
        attachments: [
            {
                url: {
                    type: String,
                    required: true,
                },
                filename: {
                    type: String,
                    required: true,
                },
                mimetype: {
                    type: String,
                    required: true,
                },
                size: {
                    type: Number,
                    required: true,
                },
            },
        ],
        pinned: {
            type: Boolean,
            default: false,
        },
        edited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },
        readBy: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        reactions: [
            {
                emoji: {
                    type: String,
                    required: true,
                },
                users: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                    },
                ],
            },
        ],
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({ project: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ pinned: 1, project: 1 });
MessageSchema.index({ 'readBy.user': 1 });

MessageSchema.pre(/^find/, function (this: mongoose.Query<any, any>, next) {
    this.populate({
        path: 'sender',
        select: 'name email avatar',
    });
    next();
});

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
