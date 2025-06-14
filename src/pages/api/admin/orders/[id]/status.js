import { Order } from '../../../../../models/Order.js';
import { Admin } from '../../../../../models/Admin.js';

export async function PUT({ params, request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const { status } = await request.json();
    
    // Validar estado
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const success = await Order.updateStatus(params.id, status);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Orden no encontrada' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, status }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar estado' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}