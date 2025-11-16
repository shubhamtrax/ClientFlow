
export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  logo?: string;
  phone?: string;
}

export type ProjectStatus = 'To Do' | 'In Progress' | 'Done';

export interface Project {
  id:string;
  name: string;
  clientId: string;
  startDate: string;
  deadline: string;
  budget: number;
  description: string;
  status: ProjectStatus;
  progress: number;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  name: string;
  projectId: string;
  status: TaskStatus;
  dueDate: string;
  description: string;
}