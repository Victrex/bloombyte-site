import { getConnection } from '../lib/db.js';

// Datos de fallback para cuando no hay conexión a la base de datos
const FALLBACK_PRODUCTS = [
  {
    id: 1,    name: 'Croissant Clásico',
    description: 'Delicioso croissant artesanal con mantequilla francesa, horneado fresco cada mañana con ingredientes premium.',
    price: 45.00,
    category: 'normal',
    image_url: '/images/products/croissant-clasico.jpg',
    is_popular: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,    name: 'Croissant de Chocolate',
    description: 'Croissant relleno con chocolate belga premium, una delicia que combina la textura crujiente con el sabor intenso del cacao.',
    price: 55.00,
    category: 'normal',
    image_url: '/images/products/croissant-chocolate.jpg',
    is_popular: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: 'Croissant de Fresa',
    description: 'Croissant dulce con mermelada de fresa natural, preparada con frutas frescas y sin conservantes artificiales.',
    price: 50.00,
    category: 'fruta',
    image_url: null,
    is_popular: false,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    name: 'Croissant de Jamón y Queso',
    description: 'Croissant salado con jamón serrano y queso manchego curado, perfecto para un desayuno o almuerzo ligero.',
    price: 65.00,
    category: 'salado',
    image_url: null,
    is_popular: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 5,
    name: 'Croissant de Almendras',
    description: 'Croissant especial relleno con crema de almendras casera y decorado con almendras laminadas tostadas.',
    price: 60.00,
    category: 'especial',
    image_url: null,
    is_popular: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 6,
    name: 'Croissant de Manzana y Canela',
    description: 'Croissant con compota de manzana verde y un toque de canela, inspirado en los sabores tradicionales del otoño.',
    price: 52.00,
    category: 'fruta',
    image_url: null,
    is_popular: false,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export class Product {
  static async getAll() {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_PRODUCTS;
    }
  }
  
  static async getPopular() {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM products WHERE is_popular = TRUE ORDER BY created_at DESC LIMIT 8');
      return rows;
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_PRODUCTS.filter(p => p.is_popular).slice(0, 8);
    }
  }
  
  static async getById(id) {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_PRODUCTS.find(p => p.id === parseInt(id));
    }
  }
  
  static async getByCategory(category) {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category]);
      return rows;
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_PRODUCTS.filter(p => p.category === category);
    }
  }
  
  static async create(productData) {
    const db = await getConnection();
    const { name, description, price, category, image_url, is_popular } = productData;
    
    const [result] = await db.execute(
      'INSERT INTO products (name, description, price, category, image_url, is_popular) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, category, image_url, is_popular || false]
    );
    
    return { id: result.insertId, ...productData };
  }
  
  static async update(id, productData) {
    const db = await getConnection();
    const { name, description, price, category, image_url, is_popular } = productData;
    
    await db.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_popular = ? WHERE id = ?',
      [name, description, price, category, image_url, is_popular, id]
    );
    
    return { id, ...productData };
  }
  
  static async delete(id) {
    const db = await getConnection();
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  static async search(query) {
    const db = await getConnection();
    const searchTerm = `%${query}%`;
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC',
      [searchTerm, searchTerm]
    );
    return rows;
  }
}