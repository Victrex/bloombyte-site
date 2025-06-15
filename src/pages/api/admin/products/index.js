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
    // Verificar tamaño de request antes de procesarlo
    const contentLength = request.headers.get('content-length');
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      console.log(`Request too large: ${contentLength} bytes`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Archivo demasiado grande. Máximo 2MB permitido.' 
        }), 
        { 
          status: 413,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing product creation request...');
    
    const formData = await request.formData();
    const productData = {};
    
    // Extraer datos del formulario
    for (const [key, value] of formData.entries()) {
      if (key === 'image' && value instanceof File && value.size > 0) {
        console.log('Processing image file:', { name: value.name, size: value.size, type: value.type });
        
        // Validar tamaño de imagen
        if (value.size > maxSize) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'La imagen es demasiado grande. Máximo 2MB.' 
            }), 
            { status: 413, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(value.type)) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Tipo de archivo no permitido. Solo JPEG, PNG o WebP.' 
            }), 
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        try {
          const { writeFile, mkdir } = await import('fs/promises');
          const { join } = await import('path');
          const { randomUUID } = await import('crypto');
          
          const uploadDir = process.env.NODE_ENV === 'production'
            ? '/root/public_html/dist/client/images/products'
            : join(process.cwd(), 'public', 'images', 'products');
          
          await mkdir(uploadDir, { recursive: true });
          
          const extension = value.name.split('.').pop();
          const fileName = `${randomUUID()}.${extension}`;
          const filepath = join(uploadDir, fileName);
          
          const bytes = await value.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filepath, buffer);
          
          console.log('Image saved successfully:', filepath);
          productData.image_url = `/images/products/${fileName}`;
          
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al subir la imagen. Por favor, intenta de nuevo.' 
            }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
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
        JSON.stringify({ 
          success: false, 
          error: 'Faltan datos requeridos: name, price, category' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Creating product with data:', productData);
    const newProduct = await Product.create(productData);
    
    return new Response(
      JSON.stringify({ success: true, product: newProduct }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    // Manejar específicamente error 413
    if (error.message.includes('request entity too large') || 
        error.message.includes('PayloadTooLargeError') ||
        error.code === 'LIMIT_FILE_SIZE') {
      console.error('Request too large error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'El archivo es demasiado grande. Por favor, usa una imagen más pequeña (máximo 2MB).' 
        }), 
        { 
          status: 413,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.error('Error creating product:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor. Por favor, intenta de nuevo.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}