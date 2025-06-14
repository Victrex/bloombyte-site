import { Order } from '../../models/Order.js';

export async function POST({ request }) {
  try {
    const orderData = await request.json();
    
    // Validar datos requeridos
    if (!orderData.customer_name || !orderData.customer_phone || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Calcular total
    const total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Crear orden
    const newOrder = await Order.create({
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      items: orderData.items,
      total: total
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        order: newOrder,
        message: 'Orden creada exitosamente'
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear la orden' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}