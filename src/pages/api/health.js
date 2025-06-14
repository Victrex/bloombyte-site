import { getConnection } from '../../lib/db.js';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      api: 'operational',
      database: 'checking...'
    }
  };
  
  try {
    // Verificar conexión a base de datos
    const db = await getConnection();
    await db.query('SELECT 1');
    health.services.database = 'operational';
  } catch (error) {
    health.status = 'degraded';
    health.services.database = 'error';
    health.error = error.message;
  }
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  
  return new Response(
    JSON.stringify(health, null, 2),
    { 
      status: statusCode, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      } 
    }
  );
}