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
    // Verificar autenticación (simplificado para testing)
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token && !request.headers.get('cookie')?.includes('admin-token')) {
    //   return new Response('No autorizado', { status: 401 });
    // }
    
    // Manejar FormData para archivos
    const formData = await request.formData();
    const productData = {};
    
    // Extraer datos del formulario
    for (const [key, value] of formData.entries()) {      if (key === 'image' && value instanceof File && value.size > 0) {
        // Manejar archivo de imagen
        console.log('Processing image file:', { name: value.name, size: value.size, type: value.type });
        try {
          // Crear FormData para la imagen
          const imageFormData = new FormData();
          imageFormData.append('image', value);
            // Llamar al endpoint de upload
          const uploadUrl = process.env.NODE_ENV === 'production' 
            ? 'https://bloombyte.vasweb.io/api/admin/upload-image'
            : 'http://localhost:4321/api/admin/upload-image';
            
          const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: imageFormData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('Image uploaded successfully:', uploadResult);
            productData.image_url = uploadResult.imageUrl;
          } else {            const errorText = await uploadResponse.text();
            console.error('Error uploading image:', errorText);
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
        }
      } else if (key !== 'image') {
        productData[key] = value.toString();
      }
    }
    
    // Convertir tipos de datos
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }
    if (productData.is_popular) {
      productData.is_popular = productData.is_popular === '1';
    } else {
      productData.is_popular = false;
    }
    
    // Validar datos requeridos
    if (!productData.name || !productData.price || !productData.category) {
      return new Response(
        JSON.stringify({ error: 'Faltan datos requeridos: name, price, category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Creating product with data:', productData);
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
      JSON.stringify({ error: 'Error al crear producto: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}