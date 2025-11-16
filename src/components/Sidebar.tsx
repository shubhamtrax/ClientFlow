
import React from 'react';
import type { View } from '../App';
import { HomeIcon, UserCircleIcon, BriefcaseIcon, ClipboardListIcon } from './icons/Icons';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
        { id: 'clients', label: 'Clients', icon: UserCircleIcon },
        { id: 'projects', label: 'Projects', icon: BriefcaseIcon },
        { id: 'tasks', label: 'Tasks', icon: ClipboardListIcon },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-[#191919] shadow-lg flex-col hidden sm:flex">
            <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
                 <svg className="h-10 w-10 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white ml-3">Client Hub</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as View)}
                        className={`w-full flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                            activeView === item.id
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                        <item.icon className="w-6 h-6 mr-4" />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;