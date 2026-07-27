"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { Settings, User, Lock, Bell, CreditCard, Database, HelpCircle, LogOut } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/store/useAuthStore';

type SettingsSection = 'account' | 'security' | 'notifications' | 'billing' | 'data' | 'help' | 'signout';

export default function SettingsPage() {
    const { user, logout } = useAuth(true);
    const [activeSection, setActiveSection] = useState<SettingsSection>('account');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        newsletter: false,
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!user) return;
        try {
            const res = await axios.put(`/api/users/${user._id}`, { name, email });
            const data = res.data;
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                useAuthStore.getState().updateUser({ name, email });
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
    };

    const handleSecuritySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        if (!user) return;
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        try {
            const res = await axios.put(`/api/users/${user._id}/password`, { currentPassword, newPassword });
            const data = res.data;
            if (data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update password' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update password' });
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="space-y-6">
                        {message.text && activeSection === 'account' && (
                            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleAccountSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-2 text-gray-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-2 text-gray-800"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                );
            
            case 'security':
                return (
                    <div className="space-y-6">
                        {message.text && activeSection === 'security' && (
                            <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleSecuritySubmit} className="space-y-6">
                            <div>
                                <label htmlFor="current-password" className="block text-sm font-medium text-gray-900">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="current-password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-2 text-gray-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-medium text-gray-900">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-2 text-gray-800"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-900">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-2 text-gray-800"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                );
            
            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {key === 'email' && 'Receive email notifications'}
                                            {key === 'push' && 'Receive push notifications'}
                                            {key === 'newsletter' && 'Subscribe to our newsletter'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        role="switch"
                                        aria-checked={value}
                                        onClick={() => setNotifications(prev => ({
                                            ...prev,
                                            [key]: !value
                                        }))}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            
            case 'billing':
                return (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <CreditCard className="h-6 w-6 text-gray-500 mr-3" />
                                <h3 className="text-lg font-medium">Payment Methods</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                You haven't added any payment methods yet.
                            </p>
                            <button
                                type="button"
                                className="mt-4 inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Add Payment Method
                            </button>
                        </div>
                    </div>
                );
            
            case 'data':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <Database className="h-6 w-6 text-gray-500 mr-3" />
                                    <h3 className="text-lg font-medium">Download Your Data</h3>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Request a copy of all your personal data.
                                </p>
                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Request Data
                                </button>
                            </div>
                            
                            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                                <div className="flex items-center">
                                    <h3 className="text-lg font-medium text-red-800">Delete Account</h3>
                                </div>
                                <p className="mt-2 text-sm text-red-700">
                                    Permanently delete your account and all of your data. This action cannot be undone.
                                </p>
                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );
            
            case 'help':
                return (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center">
                                <HelpCircle className="h-6 w-6 text-gray-500 mr-3" />
                                <h3 className="text-lg font-medium">Need Help?</h3>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                                Visit our help center or contact our support team for assistance.
                            </p>
                            <div className="mt-4 space-x-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Help Center
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </div>
                );
            
            case 'signout':
                return (
                    <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 p-6">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to sign out? You'll need to sign in again to access your account.
                            </p>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                );
            
            default:
                return null;
        }
    };

    const menuItems = [
        { id: 'account', icon: User, label: 'Account' },
        { id: 'security', icon: Lock, label: 'Security' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'billing', icon: CreditCard, label: 'Billing' },
        { id: 'data', icon: Database, label: 'Data & Privacy' },
        { id: 'help', icon: HelpCircle, label: 'Help & Support' },
        { id: 'signout', icon: LogOut, label: 'Sign Out' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-auto">
                <header className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col">
                            <h1 className="text-3xl font-bold text-blue-600">Settings</h1>
                            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 mt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="w-full lg:w-72 shrink-0">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-lg">
                                    <nav className="p-1.5">
                                        <ul className="space-y-1">
                                            {menuItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = activeSection === item.id;
                                                return (
                                                    <li key={item.id}>
                                                        <button
                                                            onClick={() => {
                                                                setActiveSection(item.id as SettingsSection);
                                                                if (item.id === 'signout') {
                                                                    logout();
                                                                }
                                                            }}
                                                            className={`w-full flex items-center px-5 py-3.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                                                                isActive 
                                                                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                        >
                                                            <div className={`p-1.5 rounded-lg mr-3 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                                <Icon className="h-5 w-5" />
                                                            </div>
                                                            <span className="text-left">{item.label}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </nav>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
                                    <div className="p-6 md:p-8">
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                                                {menuItems.find(item => item.id === activeSection)?.label}
                                                <span className="ml-3 text-blue-600">
                                                    {React.createElement(menuItems.find(item => item.id === activeSection)?.icon || 'div', { className: 'h-6 w-6' })}
                                                </span>
                                            </h2>
                                            <div className="h-1 w-12 bg-blue-500 rounded-full mt-2"></div>
                                        </div>
                                        <div className="space-y-6">
                                            {renderSection()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
