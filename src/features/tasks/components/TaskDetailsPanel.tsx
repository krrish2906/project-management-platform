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
    const { tasks, isLoading, updateTask } = useTaskStore();
    const { user } = useAuth(false);

    const projectTasks = tasks.filter(t => t.projectId === projectId);

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (projectTasks.length > 0 && !selectedTaskId) {
            setSelectedTaskId(projectTasks[0].id);
        }
    }, [projectTasks, selectedTaskId]);

    const task = projectTasks.find(t => t.id === selectedTaskId) || projectTasks[0];

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-5 text-center">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-5 text-center text-gray-500">
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
        { value: 'LOW', label: 'Low', color: 'text-green-600', bg: 'bg-green-50' },
        { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { value: 'HIGH', label: 'High', color: 'text-orange-600', bg: 'bg-orange-50' },
        { value: 'URGENT', label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
    ];

    const currentPriority = priorities.find(p => p.value === task.priority) || priorities[1];

    return (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200/50 p-5">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
                <select
                    className="text-sm border border-gray-200 rounded px-2 py-1 max-w-37.5 truncate text-gray-900"
                    value={task.id}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                    {projectTasks.map(t => (
                        <option key={t.id} value={t.id}>#{t.number} - {t.title}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Number</div>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-mono font-semibold text-gray-900">
                        #{task.number || '1'}
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
                                {reporter.avatar ? (
                                    <img src={reporter.avatar} alt={reporter.name} className="w-8 h-8 rounded-lg outline-1 outline-gray-200" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        {getUserInitials(reporter.name)}
                                    </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">{reporter.name}</span>
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
                            {task.priority === 'HIGH' || task.priority === 'URGENT' ? '↑' : task.priority === 'LOW' ? '↓' : '•'}
                        </span>
                        <span className={`text-sm font-bold ${currentPriority.color}`}>{currentPriority.label}</span>
                        <ChevronDown className={`w-4 h-4 ${currentPriority.color} absolute right-2 opacity-0 group-hover:opacity-100`} />
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer text-gray-900"
                            value={task.priority}
                            onChange={(e) => handleUpdate(task.id, { priority: e.target.value })}
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
                            onChange={(e) => handleUpdate(task.id, { dueDate: new Date(e.target.value).toISOString() })}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
