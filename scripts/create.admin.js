#!/usr/bin/env node

import { Admin } from '../src/models/Admin.js';
import readline from 'readline';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🧁 Bloom & Bite - Crear Usuario Administrador\n');

async function createAdmin() {
  try {
    const username = await question('Nombre de usuario: ');
    const password = await question('Contraseña: ');
    const confirmPassword = await question('Confirmar contraseña: ');
    
    if (password !== confirmPassword) {
      console.error('\n❌ Las contraseñas no coinciden');
      process.exit(1);
    }
    
    if (password.length < 6) {
      console.error('\n❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }
    
    console.log('\nCreando usuario...');
    
    const admin = await Admin.create(username, password);
    
    console.log('\n✅ Usuario administrador creado exitosamente');
    console.log(`ID: ${admin.id}`);
    console.log(`Usuario: ${admin.username}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();