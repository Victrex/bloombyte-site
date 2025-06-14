import { Product } from '../../../models/Product.js';
import { Order } from '../../../models/Order.js';
import { Admin } from '../../../models/Admin.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    // Obtener todos los datos
    const [products, orders] = await Promise.all([
      Product.getAll(),
      Order.getAll()
    ]);
    
    // Construir objeto de exportación
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        products: {
          count: products.length,
          items: products
        },
        orders: {
          count: orders.length,
          items: orders,
          stats: await Order.getStats()
        }
      }
    };
    
    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="bloom-bite-export-${new Date().toISOString().split('T')[0]}.json"`
        } 
      }
    );
  } catch (error) {
    console.error('Error exporting data:', error);
    return new Response(
      JSON.stringify({ error: 'Error al exportar datos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}