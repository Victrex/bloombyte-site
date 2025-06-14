import { Product } from '../../../../models/Product.js';
import { Admin } from '../../../../models/Admin.js';

export async function GET({ request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const products = await Product.getAll();
    
    return new Response(
      JSON.stringify(products),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error getting products:', error);
    return new Response(
      JSON.stringify({ error: 'Error al obtener productos' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST({ request }) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !(await Admin.verifyToken(token))) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const productData = await request.json();
    
    // Validar datos requeridos
    if (!productData.name || !productData.price || !productData.category) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const newProduct = await Product.create(productData);
    
    return new Response(
      JSON.stringify(newProduct),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(
      JSON.stringify({ error: 'Error al crear producto' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}