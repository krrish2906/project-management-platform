import Signup from '@/features/auth/components/Signup';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up - OmniSync',
    description: 'Create your OmniSync workspace and start managing projects with your team.',
};

export default function SignupPage() {
    return <Signup />;
}
