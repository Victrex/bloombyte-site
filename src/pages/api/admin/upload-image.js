import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No se recibió ningún archivo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'El archivo es demasiado grande. Máximo 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // CORREGIDO: Definir la ruta correcta según el entorno
    const uploadDir = process.env.NODE_ENV === 'production'
      ? '/root/public_html/dist/client/images/products'  // Ruta corregida
      : join(process.cwd(), 'public', 'images', 'products');
    
    // Crear directorio si no existe
    await mkdir(uploadDir, { recursive: true });
    
    // Generar nombre único para el archivo
    const extension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${extension}`;
    const filepath = join(uploadDir, fileName);  // CORREGIDO: Usar join importado
    
    // Guardar archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    
    // Retornar URL de la imagen
    const imageUrl = `/images/products/${fileName}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      imageUrl,
      message: 'Imagen subida exitosamente' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error uploading image:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor',
      details: error.message  // Para debugging
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}