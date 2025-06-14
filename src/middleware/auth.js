import { Admin } from '../models/Admin.js';

export async function authMiddleware(request) {
  const url = new URL(request.url);
  
  // Solo aplicar a rutas de admin (excepto login)
  if (url.pathname.startsWith('/admin') && !url.pathname.includes('/login')) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new Response('No autorizado', { status: 401 });
    }
    
    const user = await Admin.verifyToken(token);
    if (!user) {
      return new Response('Token inválido', { status: 401 });
    }
    
    // Agregar usuario al request
    request.locals = request.locals || {};
    request.locals.user = user;
  }
  
  return null; // Continuar con la petición
}