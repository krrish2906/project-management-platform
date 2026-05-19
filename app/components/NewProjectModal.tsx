'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import axios from 'axios';
import { X, ChevronDown, Search } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

type User = {
    _id: string;
    name: string;
    email: string;
};

type NewProjectForm = {
    name: string;
    key: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    members: string[];
};

type NewProjectModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: (newProject: any) => void;
};

export default function NewProjectModal({ isOpen, onClose, onProjectCreated }: NewProjectModalProps) {
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const term = searchTerm.toLowerCase();
        return users.filter(
            user =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
        );
    }, [users, searchTerm]);
    
    const createProject = useProjectStore(state => state.createProject);

    const [formData, setFormData] = useState<NewProjectForm>({
        name: '',
        key: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'active',
        members: []
    });

    useEffect(() => {
        if (isOpen) {
            const fetchUsers = async () => {
                try {
                    const res = await axios.get('/api/users');
                    const data = res.data;
                    if (data?.success && Array.isArray(data.data)) {
                        setUsers(data.data);
                    }
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                    setUsers([]);
                }
            };
            fetchUsers();
        }
    }, [isOpen]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const result = await createProject({
                name: formData.name,
                key: formData.key || undefined,
                description: formData.description,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
            });

            if (result) {
                onProjectCreated(result);
                onClose();
                setFormData({ name: '', key: '', description: '', startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active', members: [] });
            } else {
                setError('Failed to create project. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMemberToggle = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members.filter(id => id !== userId)
                : [...prev.members, userId]
        }));
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[5px] flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-lg p-6 relative transform transition-all duration-300 scale-95 opacity-0 animate-fadeIn text-gray-500"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                    disabled={isSubmitting}
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-blue-500">Create New Project</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                    placeholder="Enter project name"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label htmlFor="key" className="block text-sm font-medium text-gray-900 mb-1">
                                    Key
                                </label>
                                <input
                                    type="text"
                                    id="key"
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase text-gray-900 placeholder:text-gray-500"
                                    placeholder="AUTO"
                                    disabled={isSubmitting}
                                    maxLength={10}
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Leave blank to auto-generate</p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                placeholder="Enter project description"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-1">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    required
                                    value={formData.startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-1">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    required
                                    value={formData.endDate}
                                    min={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                                    disabled={isSubmitting || !formData.startDate}
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Team Members
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsMembersOpen(!isMembersOpen)}
                                    className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <span>Select team members</span>
                                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isMembersOpen ? 'transform rotate-180' : ''}`} />
                                </button>

                                {isMembersOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-60 overflow-auto">
                                        <div className="px-4 py-2 border-b sticky top-0 bg-white">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Search className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search members..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder:text-gray-500"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                                    <div
                                                        key={user._id}
                                                        className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer ${formData.members.includes(user._id) ? 'bg-blue-50' : ''
                                                            }`}
                                                        onClick={() => handleMemberToggle(user._id)}
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center h-5 ml-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.members.includes(user._id)}
                                                                onChange={() => handleMemberToggle(user._id)}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                onClick={(e) => e.stopPropagation()}
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-sm text-gray-500">No users found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selected members chips */}
                            {formData.members.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.members.map((memberId, index) => {
                                        const user = users.find(u => u._id === memberId);
                                        if (!user) return null;
                                        return (
                                            <span
                                                key={`member-${memberId}-${index}`}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {user.name}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMemberToggle(memberId);
                                                    }}
                                                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="status"
                                required
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                disabled={isSubmitting}
                            >
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : 'Create Project'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
