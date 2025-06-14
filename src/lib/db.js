import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '82.197.82.53',
  user: process.env.DB_USER || 'u844111428_vasweb02',
  password: process.env.DB_PASSWORD || 'Sh1n0by77@2002',
  database: process.env.DB_NAME || 'u844111428_bloom_bite',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};


let pool;

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    
    // Crear tablas si no existen
    await createTables();
  }
  return pool;
}

async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    // Tabla de productos
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url VARCHAR(500),
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabla de órdenes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        items JSON NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabla de usuarios admin
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
  } finally {
    connection.release();
  }
}

export default { getConnection };