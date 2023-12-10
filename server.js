const express = require('express');
const fs = require('fs').promises;

const cors = require('cors');
const app = express();
const PORT = 3001;
const DB_FILE = 'db.json';

app.use(express.json());
// Habilitar CORS
app.use(cors());

app.post('/api/catched', async (req, res) => {
    try {
        const existingData = await fs.readFile(DB_FILE, 'utf8');
        const dataObject = JSON.parse(existingData);
        dataObject.catchedPokemon.push(req.body.value);
        await fs.writeFile(DB_FILE, JSON.stringify(dataObject), 'utf8');
        res.json({ success: true, message: 'Dato guardado correctamente' });
    } catch (error) {
        console.error('Error al escribir en el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.delete('/api/data/:id', async (req, res) => {
    try {
        const existingData = await fs.readFile(DB_FILE, 'utf8');
        const dataObject = JSON.parse(existingData);
        dataObject.catchedPokemon = dataObject.catchedPokemon.filter(pokemon => pokemon.id !== parseInt(req.params.id));
        // Convierte el objeto modificado de nuevo a formato JSON
        const updatedJson = JSON.stringify(dataObject, null, 2);
        await fs.writeFile(DB_FILE, updatedJson, 'utf8');
        res.json({ success: true, message: 'Dato eliminado correctamente' });
    } catch (error) {
        console.error('Error al escribir en el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/catched', async (req, res) => {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});