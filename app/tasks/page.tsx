'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, CheckCircle2, AlertCircle, Clock, Calendar, Loader2, Bug, Zap, BookOpen, Layers, ListChecks } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import { useTaskStore } from '@/store/useTaskStore';
import { useRouter } from 'next/navigation';
import type { Task } from '@/types';

export default function GlobalTasksPage() {
    const { tasks, isLoading, fetchTasks } = useTaskStore();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.key?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            const assigneeName = typeof task.assignee === 'object' ? task.assignee?.name : '';
            const matchesAssignee = assigneeFilter === 'all' ||
                (assigneeFilter === 'unassigned' ? !task.assignee : assigneeName === assigneeFilter);
            const matchesType = typeFilter === 'all' || task.type === typeFilter;

            return matchesSearch && matchesStatus && matchesAssignee && matchesType;
        });
    }, [tasks, searchQuery, statusFilter, assigneeFilter, typeFilter]);

    const getTypeIcon = (type?: string) => {
        switch (type) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
            case 'story': return <BookOpen className="w-4 h-4 text-green-500" />;
            case 'epic': return <Zap className="w-4 h-4 text-purple-500" />;
            case 'improvement': return <Layers className="w-4 h-4 text-blue-500" />;
            default: return <ListChecks className="w-4 h-4 text-blue-400" />;
        }
    };

    const getPriorityIcon = (priority?: string) => {
        switch (priority) {
            case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
            case 'highest': return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'high': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'low': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'lowest': return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    };

    const getStatusPill = (status: string) => {
        const styles: Record<string, string> = {
            backlog: "bg-gray-100 text-gray-900 border-gray-200",
            todo: "bg-blue-50 text-blue-700 border-blue-200",
            inprogress: "bg-orange-50 text-orange-700 border-orange-200",
            review: "bg-purple-50 text-purple-700 border-purple-200",
            qa: "bg-indigo-50 text-indigo-700 border-indigo-200",
            blocked: "bg-red-50 text-red-700 border-red-200",
            done: "bg-green-50 text-green-700 border-green-200",
        };
        const labels: Record<string, string> = {
            backlog: "Backlog", todo: "To Do", inprogress: "In Progress",
            review: "Review", qa: "QA", blocked: "Blocked", done: "Done",
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${styles[status] || styles.backlog}`}>
                {labels[status] || status}
            </span>
        );
    };

    const uniqueAssignees = useMemo(() => {
        const assignees = new Set<string>();
        tasks.forEach(t => {
            const name = typeof t.assignee === 'object' ? t.assignee?.name : null;
            if (name) assignees.add(name);
        });
        return Array.from(assignees);
    }, [tasks]);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">Tasks</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage and track all tasks across all your projects.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1 max-w-3xl flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title or key (e.g. ENG-1)..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
                                />
                            </div>
                            
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium shadow-sm transition-all cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="backlog">Backlog</option>
                                <option value="todo">To Do</option>
                                <option value="inprogress">In Progress</option>
                                <option value="review">Review</option>
                                <option value="blocked">Blocked</option>
                                <option value="done">Done</option>
                            </select>

                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium shadow-sm transition-all cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="task">Task</option>
                                <option value="bug">Bug</option>
                                <option value="story">Story</option>
                                <option value="epic">Epic</option>
                                <option value="improvement">Improvement</option>
                            </select>

                            <select 
                                value={assigneeFilter}
                                onChange={(e) => setAssigneeFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium shadow-sm transition-all cursor-pointer"
                            >
                                <option value="all">All Assignees</option>
                                <option value="unassigned">Unassigned</option>
                                {uniqueAssignees.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto bg-white">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 shadow-sm z-10">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Key</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">T</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">P</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Assignee</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Project</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Due Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="w-10 h-10 text-gray-300 mb-3" />
                                                <p className="text-base font-medium text-gray-900">No issues found</p>
                                                <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map(task => {
                                        const project = typeof task.project === 'object' ? task.project : null;
                                        const assignee = typeof task.assignee === 'object' ? task.assignee : null;
                                        const projectId = typeof task.project === 'object'
                                            ? (task.project as any)._id
                                            : task.project;
                                        return (
                                            <tr
                                                key={task._id}
                                                className="hover:bg-blue-50/50 group transition-colors cursor-pointer"
                                                onClick={() => router.push(`/projects/${projectId}`)}
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-mono text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
                                                        {task.key}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div title={task.type}>
                                                        {getTypeIcon(task.type)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div title={task.priority}>
                                                        {getPriorityIcon(task.priority)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {task.title}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusPill(task.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            {assignee.avatar ? (
                                                                <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full" />
                                                            ) : (
                                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                                    {assignee.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-900">{assignee.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {project && (
                                                        <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                            {(project as any).key}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {task.dueDate ? (() => {
                                                        const due = new Date(task.dueDate);
                                                        const now = new Date();
                                                        const diffMs = due.getTime() - now.getTime();
                                                        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                                        const isDone = task.status === 'done';
                                                        const isOverdue = diffDays < 0 && !isDone;
                                                        const isDueSoon = diffDays >= 0 && diffDays <= 2 && !isDone;

                                                        return (
                                                            <div className={`flex items-center gap-1.5 text-sm font-medium ${
                                                                isOverdue 
                                                                    ? 'text-red-600' 
                                                                    : isDueSoon 
                                                                        ? 'text-amber-600' 
                                                                        : isDone 
                                                                            ? 'text-gray-500 line-through' 
                                                                            : 'text-gray-600'
                                                            }`}>
                                                                {isOverdue ? (
                                                                    <AlertCircle size={14} className="text-red-500" />
                                                                ) : (
                                                                    <Calendar size={14} className={isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-gray-500'} />
                                                                )}
                                                                {due.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        );
                                                    })() : (
                                                        <span className="text-sm text-gray-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}