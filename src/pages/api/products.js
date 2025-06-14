import { Product } from '../../models/Product.js';

export async function GET({ url }) {
  try {
    const searchParams = new URL(url).searchParams;
    const category = searchParams.get('category');
    const popular = searchParams.get('popular');
    const search = searchParams.get('search');
    
    let products;
    
    if (search) {
      products = await Product.search(search);
    } else if (category && category !== 'all') {
      products = await Product.getByCategory(category);
    } else if (popular === 'true') {
      products = await Product.getPopular();
    } else {
      products = await Product.getAll();
    }
    
    return new Response(
      JSON.stringify(products),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache por 5 minutos
        } 
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