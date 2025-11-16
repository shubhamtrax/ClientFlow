
import React, { useState, useMemo } from 'react';
import type { Project, Client, ProjectStatus } from '../types';
import Modal from './Modal';
import ProjectForm from './ProjectForm';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, CheckCircleIcon, UserCircleIcon, CalendarIcon } from './icons/Icons';

interface ProjectListProps {
    projects: Project[];
    clients: Client[];
    onAddProject: (project: Omit<Project, 'id'>) => void;
    onUpdateProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
}

const statusStyles: { [key in ProjectStatus]: { icon: React.ReactNode, text: string, border: string } } = {
    'To Do': { icon: <ClockIcon className="w-5 h-5 text-gray-500" />, text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-400' },
    'In Progress': { icon: <PencilIcon className="w-5 h-5 text-blue-500" />, text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-500' },
    'Done': { icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />, text: 'text-green-800 dark:text-green-200', border: 'border-green-500' },
};

const ProjectList: React.FC<ProjectListProps> = ({ projects, clients, onAddProject, onUpdateProject, onDeleteProject }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);

    const projectsByStatus = useMemo(() => {
        const grouped: Record<ProjectStatus, Project[]> = {
            'To Do': [],
            'In Progress': [],
            'Done': [],
        };
        for (const project of projects) {
            grouped[project.status].push(project);
        }
        return grouped;
    }, [projects]);

    const handleOpenAddModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleSaveProject = (projectData: Omit<Project, 'id'> | Project) => {
        if ('id' in projectData) {
            onUpdateProject(projectData);
        } else {
            onAddProject(projectData);
        }
        handleCloseModal();
    };

    return (
        <div className="bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Projects Board</h2>
                <button onClick={handleOpenAddModal} className="flex items-center bg-primary-600 text-white px-3 py-2 rounded-md hover:bg-primary-700 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Add Project
                </button>
            </div>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['To Do', 'In Progress', 'Done'] as ProjectStatus[]).map(status => (
                        <div key={status} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col">
                            <h3 className="font-bold text-lg mb-4 text-gray-700 dark:text-gray-200 flex items-center">
                                {statusStyles[status].icon}
                                <span className="ml-2">{status}</span>
                                 <span className="ml-auto text-sm font-normal bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5">
                                    {projectsByStatus[status].length}
                                </span>
                            </h3>
                            <div className="space-y-4 flex-1">
                                {projectsByStatus[status].map(project => {
                                    const clientName = clientMap.get(project.clientId) || 'Unknown Client';
                                    const statusStyle = statusStyles[project.status];
                                    return (
                                        <div key={project.id} className={`p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm group flex flex-col justify-between border-l-4 ${statusStyle.border}`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <p className="font-semibold text-gray-900 dark:text-white pr-2">{project.name}</p>
                                                    <div className="flex items-center flex-shrink-0 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleOpenEditModal(project)} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => onDeleteProject(project.id)} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-ellipsis overflow-hidden h-10">{project.description}</p>
                                                <div className="mt-4">
                                                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{project.progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                                                        <div
                                                            className="bg-primary-600 h-2 rounded-full"
                                                            style={{ width: `${project.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <UserCircleIcon className="w-4 h-4 mr-2" />
                                                    <span>{clientName}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                                    <span>{project.startDate} to {project.deadline}</span>
                                                </div>
                                                <div className="flex items-center font-medium">
                                                    <span className="mr-2 text-primary-600 dark:text-primary-400">₹</span>
                                                    <span>{project.budget.toLocaleString()}</span>
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
                    <p>No projects found. Click "Add Project" to get started.</p>
                </div>
            )}
            {isModalOpen && (
                <Modal title={editingProject ? 'Edit Project' : 'Add New Project'} onClose={handleCloseModal}>
                    <ProjectForm
                        project={editingProject}
                        clients={clients}
                        onSave={handleSaveProject}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ProjectList;