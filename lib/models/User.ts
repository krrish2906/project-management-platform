import mongoose, { Document, Model } from 'mongoose';

export type UserRole = 'owner' | 'admin' | 'project_manager' | 'developer' | 'viewer';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: UserRole;
    jobTitle?: string;
    department?: string;
    projects: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    resetToken: string;
    resetTokenExpiry: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['owner', 'admin', 'project_manager', 'developer', 'viewer'],
        default: 'developer',
    },
    jobTitle: {
        type: String,
        trim: true,
        maxlength: [100, 'Job title cannot be more than 100 characters'],
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot be more than 100 characters'],
    },
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
    ],
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiry: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
