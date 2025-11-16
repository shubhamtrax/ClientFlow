import express from 'express';
import path from 'path';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Persistent JSON File Database (using lowdb) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '.data/db.json');

const adapter = new JSONFile(dbPath);
const defaultData = { 
    clients: [], 
    projects: [], 
    tasks: [], 
    nextId: { client: 1, project: 1, task: 1 } 
};
const db = new Low(adapter, defaultData);

// --- API ROUTES ---

const handleRequest = (handler) => async (req, res) => {
    try {
        await db.read(); // Read the latest data from the file before every request
        await handler(req, res);
    } catch (err) {
        console.error("API Error:", err.message);
        res.status(500).json({ error: "An internal server error occurred.", details: err.message });
    }
};

const send404 = (res, type, id) => res.status(404).json({ error: `${type} with ID ${id} not found.` });

// == Clients API ==
app.get('/api/clients', handleRequest(async (req, res) => {
    const { clients } = db.data;
    res.json([...clients].sort((a, b) => a.name.localeCompare(b.name)));
}));

app.post('/api/clients', handleRequest(async (req, res) => {
    const { clients, nextId } = db.data;
    const newClient = { id: nextId.client++, ...req.body };
    clients.push(newClient);
    await db.write(); // Save changes to the file
    res.status(201).json(newClient);
}));

app.put('/api/clients/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    const { clients } = db.data;
    const clientIndex = clients.findIndex(c => c.id == id);
    if (clientIndex !== -1) {
        const { id: bodyId, ...clientData } = req.body;
        clients[clientIndex] = { ...clients[clientIndex], ...clientData };
        await db.write();
        res.json(clients[clientIndex]);
    } else {
        send404(res, 'Client', id);
    }
}));

app.delete('/api/clients/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    const clientExists = db.data.clients.some(c => c.id == id);
    if (!clientExists) return send404(res, 'Client', id);
    
    const projectIdsToDelete = db.data.projects
        .filter(p => p.clientId == id)
        .map(p => String(p.id));

    db.data.tasks = db.data.tasks.filter(t => !projectIdsToDelete.includes(t.projectId));
    db.data.projects = db.data.projects.filter(p => p.clientId != id);
    db.data.clients = db.data.clients.filter(c => c.id != id);
    
    await db.write();
    res.status(204).send();
}));

// == Projects API ==
app.get('/api/projects', handleRequest(async (req, res) => {
    const { projects } = db.data;
    const sortedProjects = [...projects].sort((a, b) => {
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA - dateB;
    });
    res.json(sortedProjects);
}));

app.post('/api/projects', handleRequest(async (req, res) => {
    const newProject = { 
        id: db.data.nextId.project++, 
        ...req.body,
        budget: Number(req.body.budget) || 0,
        progress: Number(req.body.progress) || 0
    };
    db.data.projects.push(newProject);
    await db.write();
    res.status(201).json(newProject);
}));

app.put('/api/projects/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    const projectIndex = db.data.projects.findIndex(p => p.id == id);
    if (projectIndex !== -1) {
        const { id: bodyId, ...projectData } = req.body;
        db.data.projects[projectIndex] = { 
            ...db.data.projects[projectIndex], 
            ...projectData,
            budget: Number(projectData.budget) || 0,
            progress: Number(projectData.progress) || 0
        };
        await db.write();
        res.json(db.data.projects[projectIndex]);
    } else {
        send404(res, 'Project', id);
    }
}));

app.delete('/api/projects/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    if (!db.data.projects.some(p => p.id == id)) return send404(res, 'Project', id);

    db.data.tasks = db.data.tasks.filter(t => t.projectId != id);
    db.data.projects = db.data.projects.filter(p => p.id != id);
    await db.write();
    res.status(204).send();
}));

// == Tasks API ==
app.get('/api/tasks', handleRequest(async (req, res) => {
    const { tasks } = db.data;
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA - dateB;
    });
    res.json(sortedTasks);
}));

app.post('/api/tasks', handleRequest(async (req, res) => {
    const newTask = { id: db.data.nextId.task++, ...req.body };
    db.data.tasks.push(newTask);
    await db.write();
    res.status(201).json(newTask);
}));

app.put('/api/tasks/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    const taskIndex = db.data.tasks.findIndex(t => t.id == id);
    if (taskIndex !== -1) {
        const { id: bodyId, ...taskData } = req.body;
        db.data.tasks[taskIndex] = { ...db.data.tasks[taskIndex], ...taskData };
        await db.write();
        res.json(db.data.tasks[taskIndex]);
    } else {
        send404(res, 'Task', id);
    }
}));

app.delete('/api/tasks/:id', handleRequest(async (req, res) => {
    const { id } = req.params;
    if (!db.data.tasks.some(t => t.id == id)) return send404(res, 'Task', id);

    db.data.tasks = db.data.tasks.filter(t => t.id != id);
    await db.write();
    res.status(204).send();
}));

// --- SERVE FRONTEND ---
// Serve the built static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler for single-page-applications:
// for any request that doesn't match an API route or a static file,
// send back the main index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    // Initial read of the database when the server starts
    await db.read();
    console.log(`Server is running on port ${PORT}`);
    console.log('Using file-based data store. Data will be persistent.');
});
