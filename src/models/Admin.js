import { getConnection } from '../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bloom-bite-secret-key-2024';

export class Admin {
  static async create(username, password) {
    const db = await getConnection();
    
    // Verificar si el usuario ya existe
    const [existing] = await db.execute('SELECT id FROM admin_users WHERE username = ?', [username]);
    if (existing.length > 0) {
      throw new Error('El usuario ya existe');
    }
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const [result] = await db.execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    
    return {
      id: result.insertId,
      username
    };
  }
  
  static async authenticate(username, password) {
    const db = await getConnection();
    
    // Buscar usuario
    const [rows] = await db.execute('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return {
      user: {
        id: user.id,
        username: user.username
      },
      token
    };
  }
  
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }
  
  static async getById(id) {
    const db = await getConnection();
    const [rows] = await db.execute('SELECT id, username FROM admin_users WHERE id = ?', [id]);
    return rows[0] || null;
  }
  
  static async changePassword(id, oldPassword, newPassword) {
    const db = await getConnection();
    
    // Verificar contraseña actual
    const [rows] = await db.execute('SELECT password_hash FROM admin_users WHERE id = ?', [id]);
    if (rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    const isValid = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isValid) {
      throw new Error('Contraseña actual incorrecta');
    }
    
    // Actualizar contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newPasswordHash, id]);
    
    return true;
  }
  
  // Crear usuario admin por defecto si no existe
  static async ensureDefaultAdmin() {
    const db = await getConnection();
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM admin_users');
    
    if (rows[0].count === 0) {
      await this.create('admin', 'bloomadmin2024');
      console.log('Usuario admin por defecto creado: admin / bloomadmin2024');
    }
  }
}