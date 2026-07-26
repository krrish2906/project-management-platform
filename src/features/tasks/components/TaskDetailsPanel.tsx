'use client';

import { useState, useEffect } from 'react';
import { useTaskStore } from '@/features/tasks/store/useTaskStore';
import { Calendar, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Task } from '@/types';

interface TaskDetailsPanelProps {
    projectId: string;
}

export default function TaskDetailsPanel({ projectId }: TaskDetailsPanelProps) {
    const { tasks, isLoading, fetchTasks, updateTask } = useTaskStore();
    const { user } = useAuth(false);

    const projectTasks = tasks.filter(t => {
        const tProjectId = typeof t.project === 'object' ? (t.project as any)._id : t.project;
        return tProjectId === projectId;
    });

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (projectTasks.length > 0 && !selectedTaskId) {
            setSelectedTaskId(projectTasks[0]._id);
        }
    }, [projectTasks, selectedTaskId]);

    const task = projectTasks.find(t => t._id === selectedTaskId) || projectTasks[0];

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-5 text-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-5 text-center text-gray-500">
                <p>No tasks configured yet.</p>
                <p className="text-xs mt-1">Add a task from the Kanban board to see details.</p>
            </div>
        );
    }

    const handleUpdate = async (taskId: string, updates: Record<string, any>) => {
        await updateTask(taskId, updates);
    };

    const assignee = typeof task.assignee === 'object' ? task.assignee : null;
    const reporter = typeof task.reporter === 'object' ? task.reporter : null;

    const getUserInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const priorities = [
        { value: 'lowest', label: 'Lowest', color: 'text-gray-500', bg: 'bg-gray-50' },
        { value: 'low', label: 'Low', color: 'text-gray-600', bg: 'bg-gray-100' },
        { value: 'medium', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { value: 'high', label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
        { value: 'highest', label: 'Highest', color: 'text-red-500', bg: 'bg-red-50' },
        { value: 'critical', label: 'Critical', color: 'text-red-700', bg: 'bg-red-100' },
    ];

    const currentPriority = priorities.find(p => p.value === task.priority) || priorities[2];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
                <select 
                    className="text-sm border border-gray-200 rounded px-2 py-1 max-w-37.5 truncate text-gray-900"
                    value={task._id}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                    {projectTasks.map(t => (
                        <option key={t._id} value={t._id}>{t.key} - {t.title}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Key</div>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono font-semibold text-gray-900">
                        {task.key}
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Assignee</div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        {assignee ? (
                            <>
                                {assignee.avatar ? (
                                    <img src={assignee.avatar} alt={assignee.name} className="w-8 h-8 rounded-lg outline-1 outline-gray-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {getUserInitials(assignee.name)}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">{assignee.name}</span>
                            </>
                        ) : (
                             <div className="text-sm font-medium text-gray-500 italic">Unassigned</div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Reporter</div>
                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-not-allowed">
                        {reporter ? (
                            <>
                                {(reporter as any).avatar ? (
                                    <img src={(reporter as any).avatar} alt={(reporter as any).name} className="w-8 h-8 rounded-lg outline-1 outline-gray-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {getUserInitials((reporter as any).name)}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">{(reporter as any).name}</span>
                            </>
                        ) : (
                             <div className="text-sm font-medium text-gray-500 italic">No Reporter</div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Priority</div>
                    <div className={`flex items-center gap-2 p-2 rounded-lg relative group cursor-pointer hover:brightness-95 transition-all ${currentPriority.bg}`}>
                        <span className={`${currentPriority.color} text-lg`}>
                            {task.priority === 'high' || task.priority === 'highest' || task.priority === 'critical' ? '↑' : task.priority === 'low' || task.priority === 'lowest' ? '↓' : '•'}
                        </span>
                        <span className={`text-sm font-bold ${currentPriority.color}`}>{currentPriority.label}</span>
                        <ChevronDown className={`w-4 h-4 ${currentPriority.color} absolute right-2 opacity-0 group-hover:opacity-100`} />
                        <select 
                            className="absolute inset-0 opacity-0 cursor-pointer text-gray-900"
                            value={task.priority}
                            onChange={(e) => handleUpdate(task._id, { priority: e.target.value })}
                        >
                            {priorities.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Due Date</div>
                    <div className="relative">
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 cursor-pointer">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                            </span>
                        </div>
                        <input 
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer text-gray-900 placeholder:text-gray-500"
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleUpdate(task._id, { dueDate: new Date(e.target.value).toISOString() })}
                        />
                    </div>
                </div>

                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Labels</div>
                    <div className="flex gap-2 flex-wrap">
                        {task.labels.map(label => (
                            <span key={label} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 group">
                                {label}
                                <span 
                                    className="cursor-pointer opacity-70 hover:opacity-100"
                                    onClick={() => handleUpdate(task._id, { labels: task.labels.filter(l => l !== label) })}
                                >
                                    ×
                                </span>
                            </span>
                        ))}
                        <div className="relative">
                            <button className="w-7 h-7 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all">
                                <Plus className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <select 
                                className="absolute inset-0 opacity-0 cursor-pointer text-gray-900"
                                value=""
                                onChange={(e) => {
                                    if (e.target.value && !task.labels.includes(e.target.value)) {
                                        handleUpdate(task._id, { labels: [...task.labels, e.target.value] });
                                    }
                                }}
                            >
                                <option value="" disabled>Add Label</option>
                                <option value="Frontend">Frontend</option>
                                <option value="Backend">Backend</option>
                                <option value="API">API</option>
                                <option value="Design">Design</option>
                                <option value="Bug">Bug</option>
                            </select>
                        </div>
                    </div>
                </div>

                {task.storyPoints !== undefined && task.storyPoints > 0 && (
                    <div>
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Story Points</div>
                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-bold text-gray-900">
                            {task.storyPoints} SP
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
