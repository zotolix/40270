const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Configuración para permitir datos grandes (fotos en Base64)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CONFIGURACIÓN DE CONEXIÓN (Ajusta con tus datos de Workbench)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '10030326243Danll', // <--- Usamos la contraseña de tu imagen
    database: 'sabor_universitario',
    port: 3306 
});

db.connect(err => {
    if (err) {
        console.error('❌ Error conectando a MySQL:', err.stack);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL en Workbench');
});

// RUTA PARA GUARDAR UN LOCAL (POST)
app.post('/api/locales', (req, res) => {
    const { nombre, tipo, precio, horario, pago, latitud, longitud, fotos } = req.body;
    
    const sql = `INSERT INTO locales (nombre, tipo, precio, horario, pago, latitud, longitud, fotos) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [nombre, tipo, precio, horario, pago, latitud, longitud, JSON.stringify(fotos)];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Local guardado con éxito', id: result.insertId });
    });
});

// RUTA PARA OBTENER LOS LOCALES (GET)
app.get('/api/locales', (req, res) => {
    const sql = "SELECT * FROM locales";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Convertimos el texto de fotos de nuevo a un array de JS
        const localesProcesados = results.map(l => ({
            ...l,
            fotos: JSON.parse(l.fotos || "[]"),
            lat: l.latitud, // Mapeamos para que coincida con tu JS actual
            lng: l.longitud
        }));
        res.json(localesProcesados);
    });
});

// RUTA PARA OBTENER COMENTARIOS DE UN LOCAL ESPECÍFICO
app.get('/api/comentarios/:localId', (req, res) => {
    const { localId } = req.params;
    const sql = "SELECT * FROM comentarios WHERE local_id = ? ORDER BY fecha DESC";
    db.query(sql, [localId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// RUTA PARA GUARDAR UN COMENTARIO
app.post('/api/comentarios', (req, res) => {
    const { local_id, texto, estrellas } = req.body;
    const sql = "INSERT INTO comentarios (local_id, texto, estrellas) VALUES (?, ?, ?)";
    db.query(sql, [local_id, texto, estrellas], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Comentario guardado" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});