// server.js
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const cors = require('cors');
const db = new Database('database.db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir frontend estático
app.use('/', express.static('public'));

// ----------------- API Pacientes -----------------
app.get('/api/pacientes', (req, res) => {
  const rows = db.prepare('SELECT * FROM pacientes ORDER BY id DESC').all();
  res.json(rows);
});

app.get('/api/pacientes/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM pacientes WHERE id=?').get(req.params.id);
  res.json(p);
});

app.post('/api/pacientes', (req, res) => {
  const { nombre, dni, fecha_nacimiento, telefono, direccion, genero } = req.body;
  const stmt = db.prepare('INSERT INTO pacientes (nombre,dni,fecha_nacimiento,telefono,direccion,genero) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(nombre,dni,fecha_nacimiento,telefono,direccion,genero);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.put('/api/pacientes/:id', (req, res) => {
  const id = req.params.id;
  const { nombre, dni, fecha_nacimiento, telefono, direccion, genero } = req.body;
  db.prepare('UPDATE pacientes SET nombre=?,dni=?,fecha_nacimiento=?,telefono=?,direccion=?,genero=? WHERE id=?')
    .run(nombre,dni,fecha_nacimiento,telefono,direccion,genero,id);
  res.json({ success: true });
});

app.delete('/api/pacientes/:id', (req, res) => {
  db.prepare('DELETE FROM pacientes WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ----------------- API Citas -----------------
app.get('/api/citas', (req, res) => {
  const rows = db.prepare(`SELECT c.*, p.nombre as paciente
    FROM citas c LEFT JOIN pacientes p ON c.paciente_id=p.id
    ORDER BY c.fecha DESC, c.hora DESC`).all();
  res.json(rows);
});

app.post('/api/citas', (req, res) => {
  const { paciente_id, medico, fecha, hora, motivo } = req.body;
  const stmt = db.prepare('INSERT INTO citas (paciente_id,medico,fecha,hora,motivo) VALUES (?,?,?,?,?)');
  const info = stmt.run(paciente_id,medico,fecha,hora,motivo);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.put('/api/citas/:id', (req, res) => {
  const { estado } = req.body;
  db.prepare('UPDATE citas SET estado=? WHERE id=?').run(estado, req.params.id);
  res.json({ success: true });
});

app.delete('/api/citas/:id', (req, res) => {
  db.prepare('DELETE FROM citas WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ----------------- API Historial -----------------
app.get('/api/historial/:paciente_id', (req, res) => {
  const rows = db.prepare('SELECT * FROM historial WHERE paciente_id=? ORDER BY fecha DESC').all(req.params.paciente_id);
  res.json(rows);
});

app.post('/api/historial', (req, res) => {
  const { paciente_id, fecha, diagnostico, notas, examenes, medico } = req.body;
  const stmt = db.prepare('INSERT INTO historial (paciente_id,fecha,diagnostico,notas,examenes,medico) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(paciente_id,fecha,diagnostico,notas,examenes,medico);
  res.json({ success: true, id: info.lastInsertRowid });
});

// ----------------- API Recetas -----------------
app.get('/api/recetas/:paciente_id', (req, res) => {
  const rows = db.prepare('SELECT * FROM recetas WHERE paciente_id=? ORDER BY fecha DESC').all(req.params.paciente_id);
  res.json(rows);
});

app.post('/api/recetas', (req, res) => {
  const { paciente_id, fecha, medico, medicamentos, indicaciones } = req.body;
  const stmt = db.prepare('INSERT INTO recetas (paciente_id,fecha,medico,medicamentos,indicaciones) VALUES (?,?,?,?,?)');
  const medsText = typeof medicamentos === 'string' ? medicamentos : JSON.stringify(medicamentos);
  const info = stmt.run(paciente_id,fecha,medico,medsText,indicaciones);
  res.json({ success: true, id: info.lastInsertRowid });
});

// ----------------- Endpoints auxiliares -----------------
app.get('/api/paciente-full/:id', (req,res) => {
  const paciente = db.prepare('SELECT * FROM pacientes WHERE id=?').get(req.params.id);
  const historial = db.prepare('SELECT * FROM historial WHERE paciente_id=? ORDER BY fecha DESC').all(req.params.id);
  const recetas = db.prepare('SELECT * FROM recetas WHERE paciente_id=? ORDER BY fecha DESC').all(req.params.id);
  res.json({ paciente, historial, recetas });
});

// ----------------- Start server -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
