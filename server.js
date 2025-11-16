import express from 'express';
import path from 'path';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- MongoDB Atlas Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI environment variable is not set.');
    process.exit(1);
}

const mongoClient = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dataCollection;

async function connectDB() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("ClientHubDB"); // You can name your database anything
        dataCollection = db.collection("data");
        console.log("Successfully connected to MongoDB Atlas!");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
        process.exit(1);
    }
}

// Default structure for the database if it's empty
const defaultData = { 
    clients: [], 
    projects: [], 
    tasks: [], 
    nextId: { client: 1, project: 1, task: 1 } 
};

// --- API MIDDLEWARE & ROUTES ---

// Middleware to fetch app data for each request
const handleRequest = (handler) => async (req, res) => {
    try {
        let appData = await dataCollection.findOne({ _id: "main_data" });
        if (!appData) {
            console.log("No data found, seeding database with default structure.");
            await dataCollection.insertOne({ _id: "main_data", ...defaultData });
            appData = await dataCollection.findOne({ _id: "main_data" });
        }
        await handler(req, res, appData);
    } catch (err) {
        console.error("API Error:", err.message);
        res.status(500).json({ error: "An internal server error occurred.", details: err.message });
    }
};

const send404 = (res, type, id) => res.status(404).json({ error: `${type} with ID ${id} not found.` });

// == Clients API ==
app.get('/api/clients', handleRequest(async (req, res, appData) => {
    res.json([...appData.clients].sort((a, b) => a.name.localeCompare(b.name)));
}));

app.post('/api/clients', handleRequest(async (req, res, appData) => {
    const newClient = { id: appData.nextId.client++, ...req.body };
    appData.clients.push(newClient);
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { clients: appData.clients, nextId: appData.nextId } });
    res.status(201).json(newClient);
}));

app.put('/api/clients/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    const clientIndex = appData.clients.findIndex(c => c.id === id);
    if (clientIndex !== -1) {
        const { id: bodyId, ...clientData } = req.body;
        appData.clients[clientIndex] = { ...appData.clients[clientIndex], ...clientData };
        await dataCollection.updateOne({ _id: "main_data" }, { $set: { clients: appData.clients } });
        res.json(appData.clients[clientIndex]);
    } else {
        send404(res, 'Client', id);
    }
}));

app.delete('/api/clients/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    const clientExists = appData.clients.some(c => c.id === id);
    if (!clientExists) return send404(res, 'Client', id);
    
    const projectIdsToDelete = appData.projects
        .filter(p => p.clientId == id)
        .map(p => String(p.id));

    appData.tasks = appData.tasks.filter(t => !projectIdsToDelete.includes(t.projectId));
    appData.projects = appData.projects.filter(p => p.clientId != id);
    appData.clients = appData.clients.filter(c => c.id !== id);
    
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { tasks: appData.tasks, projects: appData.projects, clients: appData.clients } });
    res.status(204).send();
}));

// == Projects API ==
app.get('/api/projects', handleRequest(async (req, res, appData) => {
    const sortedProjects = [...appData.projects].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    res.json(sortedProjects);
}));

app.post('/api/projects', handleRequest(async (req, res, appData) => {
    const newProject = { 
        id: appData.nextId.project++, 
        ...req.body,
        budget: Number(req.body.budget) || 0,
        progress: Number(req.body.progress) || 0
    };
    appData.projects.push(newProject);
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { projects: appData.projects, nextId: appData.nextId } });
    res.status(201).json(newProject);
}));

app.put('/api/projects/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    const projectIndex = appData.projects.findIndex(p => p.id === id);
    if (projectIndex !== -1) {
        const { id: bodyId, ...projectData } = req.body;
        appData.projects[projectIndex] = { 
            ...appData.projects[projectIndex], 
            ...projectData,
            budget: Number(projectData.budget) || 0,
            progress: Number(projectData.progress) || 0
        };
        await dataCollection.updateOne({ _id: "main_data" }, { $set: { projects: appData.projects } });
        res.json(appData.projects[projectIndex]);
    } else {
        send404(res, 'Project', id);
    }
}));

app.delete('/api/projects/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    if (!appData.projects.some(p => p.id === id)) return send404(res, 'Project', id);
    appData.tasks = appData.tasks.filter(t => t.projectId != id);
    appData.projects = appData.projects.filter(p => p.id !== id);
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { tasks: appData.tasks, projects: appData.projects } });
    res.status(204).send();
}));

// == Tasks API ==
app.get('/api/tasks', handleRequest(async (req, res, appData) => {
    const sortedTasks = [...appData.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    res.json(sortedTasks);
}));

app.post('/api/tasks', handleRequest(async (req, res, appData) => {
    const newTask = { id: appData.nextId.task++, ...req.body };
    appData.tasks.push(newTask);
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { tasks: appData.tasks, nextId: appData.nextId } });
    res.status(201).json(newTask);
}));

app.put('/api/tasks/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    const taskIndex = appData.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        const { id: bodyId, ...taskData } = req.body;
        appData.tasks[taskIndex] = { ...appData.tasks[taskIndex], ...taskData };
        await dataCollection.updateOne({ _id: "main_data" }, { $set: { tasks: appData.tasks } });
        res.json(appData.tasks[taskIndex]);
    } else {
        send404(res, 'Task', id);
    }
}));

app.delete('/api/tasks/:id', handleRequest(async (req, res, appData) => {
    const id = Number(req.params.id);
    if (!appData.tasks.some(t => t.id === id)) return send404(res, 'Task', id);
    appData.tasks = appData.tasks.filter(t => t.id !== id);
    await dataCollection.updateOne({ _id: "main_data" }, { $set: { tasks: appData.tasks } });
    res.status(204).send();
}));

// --- SERVE FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    connectDB(); // Connect to DB when server starts
    console.log(`Server is running on port ${PORT}`);
});