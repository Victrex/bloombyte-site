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
    for (const [key, value] of formData.entries()) {
      if (key === 'image' && value instanceof File && value.size > 0) {
        // Manejar archivo de imagen directamente sin llamada fetch
        console.log('Processing image file:', { name: value.name, size: value.size, type: value.type });
        try {
          // Importar las funciones necesarias para el upload
          const { writeFile, mkdir } = await import('fs/promises');
          const { join } = await import('path');
          const { randomUUID } = await import('crypto');
          
          // Validar tipo de archivo
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(value.type)) {
            console.error('Invalid file type:', value.type);
            continue;
          }
          
          // Validar tamaño (5MB máximo)
          const maxSize = 5 * 1024 * 1024; // 5MB
          if (value.size > maxSize) {
            console.error('File too large:', value.size);
            continue;
          }
          
          // Definir la ruta correcta según el entorno
          const uploadDir = process.env.NODE_ENV === 'production'
            ? '/root/public_html/dist/client/images/products'
            : join(process.cwd(), 'public', 'images', 'products');
          
          // Crear directorio si no existe
          await mkdir(uploadDir, { recursive: true });
          
          // Generar nombre único para el archivo
          const extension = value.name.split('.').pop();
          const fileName = `${randomUUID()}.${extension}`;
          const filepath = join(uploadDir, fileName);
          
          // Guardar archivo
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);
          
          console.log('Image saved successfully:', filepath);
          productData.image_url = `/images/products/${fileName}`;
          
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