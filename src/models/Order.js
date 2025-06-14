import { getConnection } from '../lib/db.js';

// Datos de fallback para cuando no hay conexión a la base de datos
const FALLBACK_ORDERS = [
  {
    id: 1,
    customer_name: 'Ana García',
    customer_phone: '+504 9876-5432',
    items: [
      { id: 1, name: 'Croissant Clásico', price: 45.00, quantity: 2 },
      { id: 2, name: 'Croissant de Chocolate', price: 55.00, quantity: 1 }
    ],
    total: 145.00,
    status: 'pending',
    created_at: new Date('2024-12-13T20:30:00'),
    updated_at: new Date('2024-12-13T20:30:00')
  },
  {
    id: 2,
    customer_name: 'Carlos López',
    customer_phone: '+504 8765-4321',
    items: [
      { id: 3, name: 'Croissant de Fresa', price: 50.00, quantity: 3 },
      { id: 4, name: 'Croissant de Jamón y Queso', price: 65.00, quantity: 1 }
    ],
    total: 215.00,
    status: 'completed',
    created_at: new Date('2024-12-13T19:15:00'),
    updated_at: new Date('2024-12-13T19:15:00')
  },
  {
    id: 3,
    customer_name: 'María Rodríguez',
    customer_phone: '+504 7654-3210',
    items: [
      { id: 5, name: 'Croissant de Almendras', price: 60.00, quantity: 2 }
    ],
    total: 120.00,
    status: 'pending',
    created_at: new Date('2024-12-13T18:00:00'),
    updated_at: new Date('2024-12-13T18:00:00')
  }
];

export class Order {
  static async getAll() {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
      return rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }));
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_ORDERS;
    }
  }  static async getById(id) {
    try {
      const db = await getConnection();
      const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      
      return {
        ...rows[0],
        items: typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items
      };
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_ORDERS.find(order => order.id == id) || null;
    }
  }
    static async create(orderData) {
    try {
      const db = await getConnection();
      const { customer_name, customer_phone, items, total } = orderData;
      
      const [result] = await db.execute(
        'INSERT INTO orders (customer_name, customer_phone, items, total) VALUES (?, ?, ?, ?)',
        [customer_name, customer_phone, JSON.stringify(items), total]
      );
      
      return {
        id: result.insertId,
        ...orderData,
        status: 'pending',
        created_at: new Date()
      };
    } catch (error) {
      console.warn('Database connection failed, creating fallback order:', error.message);
      // Create a fallback order with a new ID
      const newId = Math.max(...FALLBACK_ORDERS.map(o => o.id)) + 1;
      const newOrder = {
        id: newId,
        ...orderData,
        status: 'pending',
        created_at: new Date()
      };
      FALLBACK_ORDERS.push(newOrder);
      return newOrder;
    }
  }
    static async updateStatus(id, status) {
    try {
      const db = await getConnection();
      const [result] = await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.warn('Database connection failed, updating fallback order:', error.message);
      // Update the order in the fallback data
      const orderIndex = FALLBACK_ORDERS.findIndex(order => order.id == id);
      if (orderIndex !== -1) {
        FALLBACK_ORDERS[orderIndex].status = status;
        FALLBACK_ORDERS[orderIndex].updated_at = new Date();
        return true;
      }
      return false;
    }
  }  static async getPending() {
    try {
      const db = await getConnection();
      const [rows] = await db.execute(
        'SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC',
        ['pending']
      );
      
      return rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }));
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_ORDERS.filter(order => order.status === 'pending')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  }  static async getByDateRange(startDate, endDate) {
    try {
      const db = await getConnection();
      const [rows] = await db.execute(
        'SELECT * FROM orders WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
        [startDate, endDate]
      );
      
      return rows.map(row => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
      }));
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      return FALLBACK_ORDERS.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  }
    static async getTodayOrders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return this.getByDateRange(today, tomorrow);
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return FALLBACK_ORDERS.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= today && orderDate < tomorrow;
      });
    }
  }
    static async getStats() {
    try {
      const db = await getConnection();
      
      // Total de órdenes
      const [totalOrders] = await db.execute('SELECT COUNT(*) as count FROM orders');
      
      // Órdenes pendientes
      const [pendingOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = ?', ['pending']);
      
      // Ventas totales
      const [totalSales] = await db.execute('SELECT SUM(total) as total FROM orders WHERE status = ?', ['completed']);
      
      // Órdenes de hoy
      const todayOrders = await this.getTodayOrders();
        return {
        totalOrders: totalOrders[0].count,
        pendingOrders: pendingOrders[0].count,
        totalSales: Number(totalSales[0].total) || 0,
        todayOrders: todayOrders.length
      };
    } catch (error) {
      console.warn('Using fallback data - Database connection failed:', error.message);
      
      // Calculate stats from fallback data
      const totalOrders = FALLBACK_ORDERS.length;
      const pendingOrders = FALLBACK_ORDERS.filter(order => order.status === 'pending').length;
      const totalSales = FALLBACK_ORDERS
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayOrders = FALLBACK_ORDERS.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= today && orderDate < tomorrow;
      }).length;
        return {
        totalOrders,
        pendingOrders,
        totalSales: Number(totalSales) || 0,
        todayOrders
      };
    }
  }
}