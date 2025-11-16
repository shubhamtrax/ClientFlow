
import React, { useState, useMemo } from 'react';
import type { Task, Project, TaskStatus, Client } from '../types';
import Modal from './Modal';
import TaskForm from './TaskForm';
import { PlusIcon, CheckCircleIcon, PencilIcon, TrashIcon, ClockIcon, BriefcaseIcon, UserCircleIcon } from './icons/Icons';

interface TaskListProps {
    tasks: Task[];
    projects: Project[];
    clients: Client[];
    onAddTask: (task: Omit<Task, 'id'>) => void;
    onUpdateTask: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
}

const statusStyles: { [key in TaskStatus]: { icon: React.ReactNode, text: string, border: string } } = {
    'To Do': { icon: <ClockIcon className="w-5 h-5 text-gray-500" />, text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-400' },
    'In Progress': { icon: <PencilIcon className="w-5 h-5 text-blue-500" />, text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
    'Done': { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
};


const TaskList: React.FC<TaskListProps> = ({ tasks, projects, clients, onAddTask, onUpdateTask, onDeleteTask }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            'To Do': [],
            'In Progress': [],
            'Done': [],
        };
        for (const task of tasks) {
            grouped[task.status].push(task);
        }
        return grouped;
    }, [tasks]);

    const handleOpenAddModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
        if ('id' in taskData) {
            onUpdateTask(taskData);
        } else {
            onAddTask(taskData);
        }
        handleCloseModal();
    };

    return (
        <div className="bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks Board</h2>
                <button onClick={handleOpenAddModal} className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Add Task
                </button>
            </div>
            {tasks.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['To Do', 'In Progress', 'Done'] as TaskStatus[]).map(status => (
                        <div key={status} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col">
                            <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center">
                                {statusStyles[status].icon}
                                <span className="ml-2">{status}</span>
                                 <span className="ml-auto text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                                    {tasksByStatus[status].length}
                                </span>
                            </h3>
                            <div className="space-y-4 flex-1">
                                {tasksByStatus[status].map(task => {
                                    const project = projectMap.get(task.projectId);
                                    const clientName = project ? clientMap.get(project.clientId) : 'Unknown';
                                    const statusStyle = statusStyles[task.status];
                                    return (
                                        <div key={task.id} className={`p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm group flex flex-col justify-between border-l-4 ${statusStyle.border}`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white pr-2">{task.name}</p>
                                                    <div className="flex items-center flex-shrink-0 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenEditModal(task)} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => onDeleteTask(task.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-ellipsis overflow-hidden h-10">{task.description}</p>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <BriefcaseIcon className="w-4 h-4 mr-2" />
                                                    <span>{project?.name || 'Unknown Project'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <UserCircleIcon className="w-4 h-4 mr-2" />
                                                    <span>{clientName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-4 h-4 mr-2" />
                                                    <span>Due: {task.dueDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                    <p>No tasks found. Click "Add Task" to get started.</p>
                </div>
            )}
            {isModalOpen && (
                <Modal title={editingTask ? 'Edit Task' : 'Add New Task'} onClose={handleCloseModal}>
                    <TaskForm
                        task={editingTask}
                        projects={projects}
                        onSave={handleSaveTask}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default TaskList;