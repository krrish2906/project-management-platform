import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, User, Check, Loader2 } from 'lucide-react';

interface UserData {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (users: { user: string; role: string }[]) => Promise<void>;
    existingMemberIds: string[];
}

export default function InviteMemberModal({ isOpen, onClose, onInvite, existingMemberIds }: InviteMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserData[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedRole, setSelectedRole] = useState('developer');
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSelectedUsers(new Set());
            setSelectedRole('developer');
            setUsers([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchUsers = async () => {
            setIsSearching(true);
            try {
                const res = await axios.get(`/api/users?search=${encodeURIComponent(searchQuery)}`);
                const json = res.data;
                if (json.success && Array.isArray(json.data)) {
                    const availableUsers = json.data.filter((u: UserData) => !existingMemberIds.includes(u._id));
                    setUsers(availableUsers);
                }
            } catch (err) {
                console.error('Failed to search users:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery, isOpen, existingMemberIds]);

    if (!isOpen) return null;

    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    const handleInvite = async () => {
        if (selectedUsers.size === 0) return;
        setIsSubmitting(true);
        try {
            const invitees = Array.from(selectedUsers).map(userId => ({
                user: userId,
                role: selectedRole
            }));
            await onInvite(invitees);
            onClose();
        } catch (error) {
            console.error('Failed to invite members:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Invite Members</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 mb-1">Search Users</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-1">Role for new members</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                        >
                            <option value="admin">Admin</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="developer">Developer</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-100 rounded-xl p-2 bg-gray-50">
                        {isSearching ? (
                            <div className="flex items-center justify-center py-8 text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                Searching...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No matching users found to invite.
                            </div>
                        ) : (
                            users.map((user) => (
                                <div 
                                    key={user._id} 
                                    onClick={() => toggleUser(user._id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedUsers.has(user._id) ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-transparent hover:bg-gray-100'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedUsers.has(user._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                                        {selectedUsers.has(user._id) && <Check className="w-3 h-3" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 mt-auto">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleInvite}
                        disabled={selectedUsers.size === 0 || isSubmitting}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Invite {selectedUsers.size > 0 ? `(${selectedUsers.size})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}
