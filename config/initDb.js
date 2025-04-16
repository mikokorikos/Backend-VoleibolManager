// config/initDb.js
const pool = require('./db'); // Importa el pool de conexiones

// SQL para crear las tablas (adaptado de tu dump)
// Usamos CREATE TABLE IF NOT EXISTS para evitar errores si ya existen
const createTablesSQL = [
  `
  CREATE TABLE IF NOT EXISTS tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) DEFAULT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    direccion TEXT DEFAULT NULL,
    ocupacion VARCHAR(100) DEFAULT NULL, -- Ajustado de tu SQL,VARCHAR parece más adecuado
    notas TEXT DEFAULT NULL,
    -- 'activo' no estaba en tu CREATE original, pero sí en el INSERT. Lo añadimos.
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY email_unique (email) -- Buena práctica añadir índice único para email si aplica
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS equipos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    descripcion TEXT DEFAULT NULL,
    entrenador_principal VARCHAR(100) DEFAULT NULL,
    entrenador_asistente VARCHAR(100) DEFAULT NULL,
    temporada VARCHAR(50) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS jugadoras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) DEFAULT NULL,
    fecha_nacimiento DATE NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    posicion VARCHAR(50) DEFAULT NULL,
    numero_uniforme INT DEFAULT NULL,
    altura DECIMAL(5,2) DEFAULT NULL,
    peso DECIMAL(5,2) DEFAULT NULL,
    tutor_id INT DEFAULT NULL,
    tutor_secundario_id INT DEFAULT NULL,
    telefono VARCHAR(20) DEFAULT NULL,
    email VARCHAR(100) DEFAULT NULL,
    direccion TEXT DEFAULT NULL,
    escuela VARCHAR(100) DEFAULT NULL,
    grado_escolar VARCHAR(50) DEFAULT NULL,
    alergias TEXT DEFAULT NULL,
    condiciones_medicas TEXT DEFAULT NULL,
    notas TEXT DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    fecha_ingreso DATE DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE SET NULL ON UPDATE CASCADE, -- ON DELETE SET NULL es una opción si eliminas un tutor
    FOREIGN KEY (tutor_secundario_id) REFERENCES tutores(id) ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE KEY email_jugadora_unique (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
   `
   -- Tabla users para autenticación (¡IMPORTANTE!)
   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) NOT NULL UNIQUE,
     password_hash VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
   `,
  `
  CREATE TABLE IF NOT EXISTS equipo_jugadora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipo_id INT NOT NULL,
    jugadora_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE ON UPDATE CASCADE, -- CASCADE si al borrar equipo se borra la relación
    FOREIGN KEY (jugadora_id) REFERENCES jugadoras(id) ON DELETE CASCADE ON UPDATE CASCADE, -- CASCADE si al borrar jugadora se borra la relación
    UNIQUE KEY (equipo_id, jugadora_id) -- Evita duplicados
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS torneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100) DEFAULT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion TEXT DEFAULT NULL,
    organizador VARCHAR(100) DEFAULT NULL,
    costo DECIMAL(10,2) DEFAULT NULL,
    notas TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    torneo_id INT DEFAULT NULL,
    equipo_local_id INT DEFAULT NULL, -- Puede ser nulo si no es de un equipo registrado
    equipo_visitante VARCHAR(100) NOT NULL, -- Nombre del equipo visitante
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    ubicacion VARCHAR(100) DEFAULT NULL,
    resultado_local INT DEFAULT NULL,
    resultado_visitante INT DEFAULT NULL,
    notas TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (equipo_local_id) REFERENCES equipos(id) ON DELETE SET NULL ON UPDATE CASCADE -- Permitir nulo si el equipo local no está en nuestra DB
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS estadisticas_partido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partido_id INT NOT NULL,
    jugadora_id INT NOT NULL,
    puntos INT DEFAULT 0,
    aces INT DEFAULT 0,
    servicios INT DEFAULT 0,
    ataques INT DEFAULT 0,
    bloqueos INT DEFAULT 0,
    asistencias INT DEFAULT 0,
    recepciones INT DEFAULT 0,
    defensas INT DEFAULT 0,
    errores INT DEFAULT 0,
    minutos_jugados INT DEFAULT 0,
    notas TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (partido_id) REFERENCES partidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (jugadora_id) REFERENCES jugadoras(id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS jugadora_torneo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugadora_id INT NOT NULL,
    torneo_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT DEFAULT NULL,
    FOREIGN KEY (jugadora_id) REFERENCES jugadoras(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY (jugadora_id, torneo_id) -- Evita duplicados
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugadora_id INT NOT NULL,
    tutor_id INT DEFAULT NULL, -- El tutor puede no ser relevante para el pago directamente
    concepto VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    -- Adaptado a los métodos de pago que usas en el frontend
    metodo_pago VARCHAR(50) DEFAULT 'Efectivo', -- Usar VARCHAR y validar en backend/frontend
    referencia VARCHAR(100) DEFAULT NULL,
    -- Adaptado a los estados que usas en el frontend
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'pagado', 'cancelado'
    comprobante VARCHAR(255) DEFAULT NULL, -- Ruta o ID del archivo de comprobante
    notas TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jugadora_id) REFERENCES jugadoras(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id) ON DELETE SET NULL ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `,
];

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔌 Verificando/Creando tablas...');

    for (const sql of createTablesSQL) {
      // Dividir por si hay múltiples sentencias en una entrada (aunque aquí cada una es una tabla)
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for(const statement of statements) {
          try {
            await connection.query(statement);
          } catch (tableError) {
             // Ignorar errores de tabla ya existente, mostrar otros
             if (tableError.code !== 'ER_TABLE_EXISTS_ERROR') {
                console.error(`❌ Error ejecutando: ${statement.substring(0, 60)}...`, tableError.message);
             } else {
                // Opcional: registrar que la tabla ya existía
                // console.log(`❕ Tabla ya existe (ignorado): ${statement.match(/CREATE TABLE IF NOT EXISTS `?(\w+)`?/i)?.[1]}`);
             }
          }
      }
    }

    console.log('✅ Tablas verificadas/creadas correctamente.');

  } catch (error) {
    console.error('❌ Error fatal durante la inicialización de la base de datos:', error);
    // Considera terminar el proceso si la inicialización falla
    // process.exit(1);
  } finally {
    if (connection) {
      connection.release(); // Siempre libera la conexión
      console.log('🔑 Conexión de inicialización liberada.');
    }
  }
};

module.exports = initializeDatabase;