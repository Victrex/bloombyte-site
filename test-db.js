#!/usr/bin/env node

import { getConnection } from './src/lib/db.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🧁 Bloom & Bite - Test de Base de Datos\n');

async function testDatabase() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    const db = await getConnection();
    console.log('✅ Conexión exitosa!\n');
    
    // Verificar si la tabla products existe
    console.log('🔍 Verificando tabla products...');
    const [tables] = await db.execute("SHOW TABLES LIKE 'products'");
    
    if (tables.length === 0) {
      console.log('❌ Tabla products no existe. Creándola...');
      
      await db.execute(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category ENUM('normal', 'fruta', 'salado', 'especial') DEFAULT 'normal',
          image_url VARCHAR(500),
          is_popular BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla products creada!\n');
    } else {
      console.log('✅ Tabla products existe!\n');
    }
    
    // Verificar productos existentes
    console.log('🔍 Verificando productos existentes...');
    const [products] = await db.execute('SELECT * FROM products');
    console.log(`📦 Productos encontrados: ${products.length}\n`);
    
    if (products.length === 0) {
      console.log('🔧 Agregando productos de prueba...');
      
      const sampleProducts = [
        {
          name: 'Croissant Clásico',
          description: 'Delicioso croissant artesanal con mantequilla francesa',
          price: 45.00,
          category: 'normal',
          is_popular: true
        },
        {
          name: 'Croissant de Chocolate',
          description: 'Croissant relleno con chocolate belga premium',
          price: 55.00,
          category: 'normal',
          is_popular: true
        },
        {
          name: 'Croissant de Fresa',
          description: 'Croissant dulce con mermelada de fresa natural',
          price: 50.00,
          category: 'fruta',
          is_popular: false
        },
        {
          name: 'Croissant de Jamón y Queso',
          description: 'Croissant salado con jamón serrano y queso manchego',
          price: 65.00,
          category: 'salado',
          is_popular: true
        }
      ];
      
      for (const product of sampleProducts) {
        await db.execute(
          'INSERT INTO products (name, description, price, category, is_popular) VALUES (?, ?, ?, ?, ?)',
          [product.name, product.description, product.price, product.category, product.is_popular]
        );
        console.log(`✅ ${product.name} agregado`);
      }
      
      console.log('\n🎉 Productos de prueba agregados exitosamente!');
    } else {
      console.log('📋 Productos existentes:');
      products.forEach(product => {
        console.log(`  - ID: ${product.id}, Nombre: ${product.name}, Precio: L.${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testDatabase();
