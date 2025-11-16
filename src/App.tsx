
import React, { useState, useEffect } from 'react';
import type { Client, Project, Task } from './types';
import ClientList from './components/ClientList';
import ProjectList from './components/ProjectList';
import TaskList from './components/TaskList';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

export type View = 'dashboard' | 'clients' | 'projects' | 'tasks';

const API_BASE_URL = '';

const App: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    
    const [activeView, setActiveView] = useState<View>('dashboard');

    // Fetch all data from the backend on initial load
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, projectsRes, tasksRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/clients`),
                    fetch(`${API_BASE_URL}/api/projects`),
                    fetch(`${API_BASE_URL}/api/tasks`)
                ]);

                if (!clientsRes.ok || !projectsRes.ok || !tasksRes.ok) {
                    throw new Error('Failed to fetch data from the server.');
                }

                const clientsData = await clientsRes.json();
                const projectsData = await projectsRes.json();
                const tasksData = await tasksRes.json();

                setClients(clientsData);
                setProjects(projectsData);
                setTasks(tasksData);

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchData();
    }, []);
    
    // == Client Handlers ==
    const addClient = async (client: Omit<Client, 'id'>) => {
        const response = await fetch(`${API_BASE_URL}/api/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(client),
        });
        if (response.ok) {
            const newClientData = await response.json();
            setClients(prev => [...prev, newClientData]);
        } else {
            console.error("Failed to add client");
        }
    };

    const updateClient = async (updatedClient: Client) => {
        const response = await fetch(`${API_BASE_URL}/api/clients/${updatedClient.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedClient),
        });
        if (response.ok) {
            const savedClient = await response.json();
            setClients(prev => prev.map(c => c.id === savedClient.id ? savedClient : c));
        } else {
            console.error("Failed to update client");
        }
    };

    const deleteClient = async (clientId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            // Because of "ON DELETE CASCADE" in Supabase, we just need to update the client list.
            // For a faster UI, we can predictively remove associated projects and tasks from state.
            const clientProjectIds = projects
                .filter(p => p.clientId === clientId)
                .map(p => p.id);
            setClients(prev => prev.filter(c => c.id !== clientId));
            setProjects(prev => prev.filter(p => p.clientId !== clientId));
            setTasks(prev => prev.filter(t => !clientProjectIds.includes(t.projectId)));
        } else {
            console.error("Failed to delete client");
        }
    };

    // == Project Handlers ==
    const addProject = async (project: Omit<Project, 'id'>) => {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(project),
        });
        if (response.ok) {
            const newProjectData = await response.json();
            setProjects(prev => [...prev, newProjectData]);
        } else {
            console.error("Failed to add project");
        }
    };

    const updateProject = async (updatedProject: Project) => {
        const response = await fetch(`${API_BASE_URL}/api/projects/${updatedProject.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProject),
        });
        if (response.ok) {
            const savedProject = await response.json();
            setProjects(prev => prev.map(p => p.id === savedProject.id ? savedProject : p));
        } else {
            console.error("Failed to update project");
        }
    };

    const deleteProject = async (projectId: string) => {
        const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            setTasks(prev => prev.filter(t => t.projectId !== projectId));
        } else {
            console.error("Failed to delete project");
        }
    };

    // == Task Handlers ==
    const addTask = async (task: Omit<Task, 'id'>) => {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task),
        });
        if (response.ok) {
            const newTaskData = await response.json();
            setTasks(prev => [...prev, newTaskData]);
        } else {
            console.error("Failed to add task");
        }
    };

    const updateTask = async (updatedTask: Task) => {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${updatedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTask),
        });
        if (response.ok) {
            const savedTask = await response.json();
            setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
        } else {
            console.error("Failed to update task");
        }
    };

    const deleteTask = async (taskId: string) => {
         const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
        } else {
            console.error("Failed to delete task");
        }
    };

    const renderContent = () => {
        const containerClasses = "p-4 sm:p-6 lg:p-8";
        switch (activeView) {
            case 'dashboard':
                return <Dashboard clients={clients} projects={projects} tasks={tasks} />;
            case 'clients':
                return (
                    <div className={containerClasses}>
                        <ClientList
                            clients={clients}
                            onAddClient={addClient}
                            onUpdateClient={updateClient}
                            onDeleteClient={deleteClient}
                        />
                    </div>
                );
            case 'projects':
                return (
                     <div className={containerClasses}>
                        <ProjectList
                            projects={projects}
                            clients={clients}
                            onAddProject={addProject}
                            onUpdateProject={updateProject}
                            onDeleteProject={deleteProject}
                        />
                    </div>
                );
            case 'tasks':
                return (
                     <div className={containerClasses}>
                        <TaskList
                            tasks={tasks}
                            projects={projects}
                            clients={clients}
                            onAddTask={addTask}
                            onUpdateTask={updateTask}
                            onDeleteTask={deleteTask}
                        />
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-[#131313] text-gray-900 dark:text-gray-100 font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;