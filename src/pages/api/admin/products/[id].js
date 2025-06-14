import { Product } from '../../../../models/Product.js';
import { Admin } from '../../../../models/Admin.js';

export async function GET({ params, request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const product = await Product.getById(params.id);
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify(product),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting product:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PUT({ params, request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const productData = await request.json();
    const updatedProduct = await Product.update(params.id, productData);
    
    return new Response(
      JSON.stringify(updatedProduct),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE({ params, request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const success = await Product.delete(params.id);
    
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Producto no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(
      JSON.stringify({ error: 'Error al eliminar producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}