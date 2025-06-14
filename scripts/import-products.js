#!/usr/bin/env node

import { Product } from '../src/models/Product.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧁 Bloom & Bite - Importador de Productos\n');

async function importProducts() {
  try {
    // Leer archivo de productos de ejemplo
    const productsPath = path.join(__dirname, '..', 'database', 'sample-products.json');
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);
    
    console.log(`📦 Encontrados ${products.length} productos para importar\n`);
    
    let imported = 0;
    let errors = 0;
    
    for (const product of products) {
      try {
        console.log(`Importando: ${product.name}...`);
        await Product.create(product);
        imported++;
        console.log(`✅ ${product.name} importado correctamente`);
      } catch (error) {
        console.error(`❌ Error al importar ${product.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Resumen de importación:');
    console.log(`✅ Productos importados: ${imported}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📦 Total procesados: ${products.length}`);
    
  } catch (error) {
    console.error('\n❌ Error al importar productos:', error.message);
  } finally {
    process.exit(0);
  }
}

// Confirmar antes de importar
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('⚠️  Esta acción agregará productos de ejemplo a la base de datos. ¿Continuar? (s/n): ', (answer) => {
  if (answer.toLowerCase() === 's') {
    rl.close();
    importProducts();
  } else {
    console.log('Importación cancelada.');
    rl.close();
    process.exit(0);
  }
});