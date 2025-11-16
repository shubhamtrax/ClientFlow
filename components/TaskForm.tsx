import React, { useState } from 'react';
import type { Task, TaskStatus, Project } from '../types';
import DatePicker from './DatePicker';

interface TaskFormProps {
    task?: Task | null;
    projects: Project[];
    onSave: (task: Omit<Task, 'id'> | Task) => void;
    onCancel: () => void;
}

const taskStatuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];

const TaskForm: React.FC<TaskFormProps> = ({ task, projects, onSave, onCancel }) => {
    const [name, setName] = useState(task?.name || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState<TaskStatus>(task?.status || 'To Do');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [selectedProjectId, setSelectedProjectId] = useState(task?.projectId || (projects.length > 0 ? projects[0].id : ''));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
         if (!selectedProjectId) {
            alert("Please select a project.");
            return;
        }
        const taskData = { name, description, status, dueDate, projectId: selectedProjectId };
        if (task) {
            onSave({ ...task, ...taskData });
        } else {
            onSave(taskData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project</label>
                <select 
                    id="project" 
                    value={selectedProjectId} 
                    onChange={e => setSelectedProjectId(e.target.value)} 
                    required 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Task Name</label>
                <input type="text" id="taskName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
             <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="taskDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <DatePicker selectedDate={dueDate} onChange={setDueDate} />
            </div>
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                    {taskStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save Task</button>
            </div>
        </form>
    );
};

export default TaskForm;