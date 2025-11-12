// init_db.js
const Database = require('better-sqlite3');
const db = new Database('database.db');

function run() {
  // Usuarios (personal) - opcional
  db.prepare(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    nombre TEXT,
    rol TEXT
  )`).run();

  // Pacientes
  db.prepare(`CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dni TEXT,
    fecha_nacimiento TEXT,
    telefono TEXT,
    direccion TEXT,
    genero TEXT
  )`).run();

  // Citas
  db.prepare(`CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    medico TEXT,
    fecha TEXT,
    hora TEXT,
    motivo TEXT,
    estado TEXT DEFAULT 'programada',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  )`).run();

  // Historial clínico (registros)
  db.prepare(`CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    fecha TEXT,
    diagnostico TEXT,
    notas TEXT,
    examenes TEXT,
    medico TEXT,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  )`).run();

  // Recetas
  db.prepare(`CREATE TABLE IF NOT EXISTS recetas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER,
    fecha TEXT,
    medico TEXT,
    medicamentos TEXT,  -- JSON string o texto
    indicaciones TEXT,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id)
  )`).run();

  // Datos de ejemplo: pacientes
  const count = db.prepare('SELECT count(*) AS c FROM pacientes').get().c;
  if (count === 0) {
    const insertP = db.prepare('INSERT INTO pacientes (nombre,dni,fecha_nacimiento,telefono,direccion,genero) VALUES (?,?,?,?,?,?)');
    insertP.run('Juan Perez','12345678','1985-05-10','70000000','Calle Falsa 123','M');
    insertP.run('María López','87654321','1990-07-20','70123456','Av. Siempreviva 456','F');

    const insertC = db.prepare('INSERT INTO citas (paciente_id,medico,fecha,hora,motivo) VALUES (?,?,?,?,?)');
    insertC.run(1,'Dr. Gómez','2025-12-01','09:00','Consulta general');
    insertC.run(2,'Dra. Ruiz','2025-12-02','10:30','Control');

    const insertH = db.prepare('INSERT INTO historial (paciente_id,fecha,diagnostico,notas,examenes,medico) VALUES (?,?,?,?,?,?)');
    insertH.run(1,'2024-01-15','Hipertensión','Iniciar tratamiento','toma de presión','Dr. Gómez');

    const insertR = db.prepare('INSERT INTO recetas (paciente_id,fecha,medico,medicamentos,indicaciones) VALUES (?,?,?,?,?)');
    insertR.run(1,'2024-01-15','Dr. Gómez',JSON.stringify([{nombre:'Enalapril',dosis:'10 mg',veces:'1 vez al día'}]),'Tomar por la mañana');
  }

  console.log('✅ database.db creada/actualizada con tablas y datos ejemplo.');
}

run();
