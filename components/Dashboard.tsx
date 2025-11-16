import React, { useMemo } from 'react';
import type { Client, Project, Task } from '../types';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon, PencilIcon, UserCircleIcon, ClipboardListIcon } from './icons/Icons';

interface DashboardProps {
    clients: Client[];
    projects: Project[];
    tasks: Task[];
}

// FIX: Changed `icon` prop type from `React.ReactNode` to `React.ReactElement<{ className?: string }>`
// to correctly type it for `React.cloneElement` which expects an element that can accept a `className`.
// This resolves the TypeScript overload error.
const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactElement<{ className?: string }>; borderColor: string }> = ({ title, value, icon, borderColor }) => (
    <div className={`bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6 relative overflow-hidden border-l-4 ${borderColor}`}>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className="absolute -top-2 -right-2 text-gray-200 dark:text-gray-700">
            {React.cloneElement(icon, { className: 'w-20 h-20 opacity-60' })}
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ clients, projects, tasks }) => {
    const projectStats = useMemo(() => {
        return projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [projects]);
    
    const totalProjects = projects.length;

    const taskStats = useMemo(() => {
        return tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [tasks]);

    const upcomingDeadlines = useMemo(() => {
        const today = new Date();
        const nextTwoWeeks = new Date();
        nextTwoWeeks.setDate(today.getDate() + 14);

        const upcomingProjects = projects
            .filter(p => p.deadline && new Date(p.deadline) >= today && new Date(p.deadline) <= nextTwoWeeks)
            .map(p => ({ ...p, type: 'Project', date: p.deadline }));
            
        const upcomingTasks = tasks
            .filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) <= nextTwoWeeks)
            .map(t => ({ ...t, type: 'Task', date: t.dueDate }));

        return [...upcomingProjects, ...upcomingTasks]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
    }, [projects, tasks]);

    const recentlyCompletedTasks = useMemo(() => {
        return tasks.filter(task => task.status === 'Done').slice(0, 5);
    }, [tasks]);
    
    const getDaysLeft = (dateString: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(dateString);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `in ${diffDays} days`;
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value={clients.length} icon={<UserCircleIcon />} borderColor="border-blue-500" />
                <StatCard title="Total Projects" value={projects.length} icon={<BriefcaseIcon />} borderColor="border-primary-500" />
                <StatCard title="In Progress" value={projectStats['In Progress'] || 0} icon={<PencilIcon />} borderColor="border-yellow-500" />
                <StatCard title="Tasks To Do" value={taskStats['To Do'] || 0} icon={<ClockIcon />} borderColor="border-red-500" />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Project Status */}
                    <div className="bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Project Status</h2>
                        <div className="space-y-6">
                           <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">To Do</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{projectStats['To Do'] || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                    <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${totalProjects > 0 ? ((projectStats['To Do'] || 0) / totalProjects * 100) : 0}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">In Progress</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{projectStats['In Progress'] || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalProjects > 0 ? ((projectStats['In Progress'] || 0) / totalProjects * 100) : 0}%` }}></div>
                                </div>
                            </div>
                             <div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">Done</span>
                                    <span className="font-bold text-gray-800 dark:text-gray-100">{projectStats['Done'] || 0}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalProjects > 0 ? ((projectStats['Done'] || 0) / totalProjects * 100) : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
                         <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                         <div className="space-y-4">
                            {recentlyCompletedTasks.length > 0 ? recentlyCompletedTasks.map(task => (
                                <div key={task.id} className="flex items-center">
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full mr-3">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{task.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Task marked as completed.</p>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity.</p>}
                         </div>
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="lg:col-span-2 bg-white dark:bg-[#191919] rounded-lg shadow-lg p-6">
                     <h2 className="text-xl font-bold mb-4">Upcoming Deadlines (Next 14 Days)</h2>
                     <div className="space-y-3">
                        {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(item => (
                            <div key={`${item.type}-${item.id}`} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full mr-4 ${item.type === 'Project' ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}>
                                        {item.type === 'Project' ? <BriefcaseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" /> : <ClipboardListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{item.date}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{getDaysLeft(item.date)}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-500 dark:text-gray-400">No deadlines in the next two weeks.</p>}
                     </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;