#!/usr/bin/env node

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Diagnóstico de Base de Datos\n');

async function diagnose() {
  console.log('📋 Configuración:');
  console.log(`  - Host: ${process.env.DB_HOST}`);
  console.log(`  - Usuario: ${process.env.DB_USER}`);
  console.log(`  - Base de datos: ${process.env.DB_NAME}`);
  console.log(`  - Contraseña: ${process.env.DB_PASSWORD ? '***' : 'NO CONFIGURADA'}\n`);
  
  try {
    console.log('🔌 Intentando conectar a MySQL...');
    
    // Primero intentar conectar sin especificar base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });
    
    console.log('✅ Conexión a MySQL exitosa!\n');
    
    // Verificar si la base de datos existe
    console.log('🔍 Verificando si la base de datos existe...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'bloom_bite'));
    
    if (!dbExists) {
      console.log('❌ Base de datos no existe. Creándola...');
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'bloom_bite'}`);
      console.log('✅ Base de datos creada!\n');
    } else {
      console.log('✅ Base de datos existe!\n');
    }
    
    // Ahora conectar a la base de datos específica
    await connection.changeUser({database: process.env.DB_NAME || 'bloom_bite'});
    
    console.log('🔍 Verificando tablas...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Tablas encontradas: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('🔧 No hay tablas. El servidor está funcionando pero necesita configuración inicial.');
    } else {
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    }
    
    await connection.end();
    console.log('\n🎉 Diagnóstico completado. MySQL está funcionando correctamente.');
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('  1. Asegúrate de que MySQL esté corriendo');
      console.log('  2. Verifica que el puerto sea el correcto (usualmente 3306)');
      console.log('  3. Verifica que el host sea accesible');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Posibles soluciones:');
      console.log('  1. Verifica el usuario y contraseña en el archivo .env');
      console.log('  2. Asegúrate de que el usuario tenga permisos');
    }
  }
}

diagnose();
