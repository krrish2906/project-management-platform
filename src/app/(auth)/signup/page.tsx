import Signup from '@/features/auth/components/Signup';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up - ProjectHub',
    description: 'Create your ProjectHub workspace and start managing projects with your team.',
};

export default function SignupPage() {
    return <Signup />;
}
