import React, { useState } from 'react';
import axios from 'axios';
import { X, Loader2, Target, Globe, Lock, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated?: (project: any) => void;
}

const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 
    'bg-yellow-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'
];

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('private');
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        if (!key || key === name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase()) {
            setKey(newName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase());
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await axios.post('/api/projects', {
                name,
                key: key || undefined,
                description,
                visibility,
                color: selectedColor.replace('bg-', ''),
                icon: 'Folder'
            });

            const json = res.data;
            if (!json.success) {
                throw new Error(json.message || 'Failed to create project');
            }

            if (onProjectCreated) {
                onProjectCreated(json.data.project);
            }
            onClose();
            router.push(`/projects/${json.data.project._id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Target className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Create New Project</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Project Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={handleNameChange}
                                placeholder="e.g. Website Redesign"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Key</label>
                            <input
                                type="text"
                                value={key}
                                onChange={e => setKey(e.target.value.toUpperCase())}
                                placeholder="e.g. WEB"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 uppercase"
                                maxLength={5}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What is this project about?"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-500 min-h-20 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">Project Color</label>
                        <div className="flex items-center gap-3">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full ${color} transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110 cursor-pointer'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3">Visibility</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setVisibility('private')}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left cursor-pointer transition-colors ${visibility === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200 bg-white'}`}
                            >
                                <Lock className={`w-5 h-5 mt-0.5 ${visibility === 'private' ? 'text-blue-600' : 'text-gray-500'}`} />
                                <div>
                                    <p className={`font-semibold ${visibility === 'private' ? 'text-blue-900' : 'text-gray-900'}`}>Private</p>
                                    <p className={`text-xs mt-1 ${visibility === 'private' ? 'text-blue-700' : 'text-gray-500'}`}>Only project members can view and edit</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setVisibility('public')}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left cursor-pointer transition-colors ${visibility === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200 bg-white'}`}
                            >
                                <Globe className={`w-5 h-5 mt-0.5 ${visibility === 'public' ? 'text-blue-600' : 'text-gray-500'}`} />
                                <div>
                                    <p className={`font-semibold ${visibility === 'public' ? 'text-blue-900' : 'text-gray-900'}`}>Public</p>
                                    <p className={`text-xs mt-1 ${visibility === 'public' ? 'text-blue-700' : 'text-gray-500'}`}>Anyone in the workspace can view</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name || isSubmitting}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 rounded-xl transition-all shadow-sm flex items-center cursor-pointer"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
