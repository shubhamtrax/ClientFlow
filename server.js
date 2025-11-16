import express from 'express';
import path from 'path';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// --- Environment and Supabase Setup ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('FATAL ERROR: Supabase environment variables SUPABASE_URL and SUPABASE_ANON_KEY are not set.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 logos

// --- API Error Handling ---
const handleSupabaseError = (res, error, resource = 'Item') => {
    console.error(`Supabase error for ${resource}:`, error.message);
    res.status(500).json({ error: error.message });
};

const handleNotFound = (res, data, resource = 'Item', id = '') => {
    if (!data) {
        return res.status(404).json({ error: `${resource} with ID ${id} not found.` });
    }
    return true; // Indicates success, allowing chaining
};

// == Clients API ==
app.get('/api/clients', async (req, res) => {
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) return handleSupabaseError(res, error, 'Clients');
    res.json(data);
});

app.post('/api/clients', async (req, res) => {
    const { id, ...clientData } = req.body; // Ensure no ID is passed on creation
    const { data, error } = await supabase.from('clients').insert(clientData).select().single();
    if (error) return handleSupabaseError(res, error, 'Client');
    res.status(201).json(data);
});

app.put('/api/clients/:id', async (req, res) => {
    const { id } = req.params;
    const { id: bodyId, ...clientData } = req.body;
    const { data, error } = await supabase.from('clients').update(clientData).eq('id', id).select().single();
    if (error) return handleSupabaseError(res, error, 'Client');
    if (handleNotFound(res, data, 'Client', id)) {
        res.json(data);
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    const { id } = req.params;
    // With "ON DELETE CASCADE" in the database schema, Supabase handles deleting related projects and tasks.
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) return handleSupabaseError(res, error, 'Client');
    res.status(204).send();
});


// == Projects API ==
app.get('/api/projects', async (req, res) => {
    const { data, error } = await supabase.from('projects').select('*').order('deadline');
    if (error) return handleSupabaseError(res, error, 'Projects');
    res.json(data);
});

app.post('/api/projects', async (req, res) => {
    const { id, ...projectData } = req.body;
    const { data, error } = await supabase.from('projects').insert(projectData).select().single();
    if (error) return handleSupabaseError(res, error, 'Project');
    res.status(201).json(data);
});

app.put('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    const { id: bodyId, ...projectData } = req.body;
    const { data, error } = await supabase.from('projects').update(projectData).eq('id', id).select().single();
    if (error) return handleSupabaseError(res, error, 'Project');
    if (handleNotFound(res, data, 'Project', id)) {
        res.json(data);
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    const { id } = req.params;
    // With "ON DELETE CASCADE", Supabase handles deleting related tasks.
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return handleSupabaseError(res, error, 'Project');
    res.status(204).send();
});


// == Tasks API ==
app.get('/api/tasks', async (req, res) => {
    const { data, error } = await supabase.from('tasks').select('*').order('dueDate');
    if (error) return handleSupabaseError(res, error, 'Tasks');
    res.json(data);
});

app.post('/api/tasks', async (req, res) => {
    const { id, ...taskData } = req.body;
    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    if (error) return handleSupabaseError(res, error, 'Task');
    res.status(201).json(data);
});

app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { id: bodyId, ...taskData } = req.body;
    const { data, error } = await supabase.from('tasks').update(taskData).eq('id', id).select().single();
    if (error) return handleSupabaseError(res, error, 'Task');
    if (handleNotFound(res, data, 'Task', id)) {
        res.json(data);
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return handleSupabaseError(res, error, 'Task');
    res.status(204).send();
});


// --- SERVE FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Connecting to Supabase...');
});