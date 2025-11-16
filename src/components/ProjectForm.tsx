import React, { useState } from 'react';
import type { Project, ProjectStatus, Client } from '../types';
import DatePicker from './DatePicker';

interface ProjectFormProps {
    project?: Project | null;
    clients: Client[];
    onSave: (project: Omit<Project, 'id'> | Project) => void;
    onCancel: () => void;
}

const projectStatuses: ProjectStatus[] = ['To Do', 'In Progress', 'Done'];

const ProjectForm: React.FC<ProjectFormProps> = ({ project, clients, onSave, onCancel }) => {
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [startDate, setStartDate] = useState(project?.startDate || '');
    const [deadline, setDeadline] = useState(project?.deadline || '');
    const [budget, setBudget] = useState(project?.budget || 0);
    const [status, setStatus] = useState<ProjectStatus>(project?.status || 'To Do');
    const [progress, setProgress] = useState(project?.progress || 0);
    const [selectedClientId, setSelectedClientId] = useState(project?.clientId || (clients.length > 0 ? clients[0].id : ''));


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClientId) {
            // Or handle this with better UX
            alert("Please select a client.");
            return;
        }
        const projectData = { name, description, startDate, deadline, budget, status, clientId: selectedClientId, progress };
        if (project) {
            onSave({ ...project, ...projectData });
        } else {
            onSave(projectData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                <select 
                    id="client" 
                    value={selectedClientId} 
                    onChange={e => setSelectedClientId(e.target.value)} 
                    required 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                    <option value="" disabled>Select a client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                <input type="text" id="projectName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea id="projectDescription" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <DatePicker selectedDate={startDate} onChange={setStartDate} />
                </div>
                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
                    <DatePicker selectedDate={deadline} onChange={setDeadline} />
                </div>
            </div>
             <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget (₹)</label>
                <input type="number" id="budget" value={budget} onChange={e => setBudget(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress ({progress}%)</label>
                <input
                    type="range"
                    id="progress"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                />
            </div>
             <div>
                <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="projectStatus" value={status} onChange={e => setStatus(e.target.value as ProjectStatus)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                    {projectStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Save Project</button>
            </div>
        </form>
    );
};

export default ProjectForm;