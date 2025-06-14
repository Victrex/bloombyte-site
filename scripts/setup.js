#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🧁 Bloom & Bite - Configuración Inicial\n');

async function setup() {
  try {
    // Verificar si .env ya existe
    const envPath = path.join(rootDir, '.env');
    const envExists = await fs.access(envPath).then(() => true).catch(() => false);
    
    if (envExists) {
      const overwrite = await question('El archivo .env ya existe. ¿Deseas sobrescribirlo? (s/n): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('Configuración cancelada.');
        process.exit(0);
      }
    }
    
    console.log('\n📝 Configuración de Base de Datos:');
    const dbHost = await question('Host de MySQL (localhost): ') || 'localhost';
    const dbUser = await question('Usuario de MySQL: ');
    const dbPassword = await question('Contraseña de MySQL: ');
    const dbName = await question('Nombre de la base de datos (bloom_bite): ') || 'bloom_bite';
    
    console.log('\n📱 Configuración de WhatsApp:');
    const whatsappNumber = await question('Número de WhatsApp (con código de país, ej: +50412345678): ');
    
    console.log('\n🌐 Configuración del Sitio:');
    const siteUrl = await question('URL del sitio (https://tudominio.com): ');
    
    // Generar JWT Secret
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    
    // Crear contenido del .env
    const envContent = `# Base de datos MySQL
DB_HOST=${dbHost}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}
DB_NAME=${dbName}

# JWT Secret para autenticación
JWT_SECRET=${jwtSecret}

# WhatsApp
PUBLIC_WHATSAPP_NUMBER=${whatsappNumber}

# Configuración del servidor
NODE_ENV=production
PORT=3000

# URL del sitio
PUBLIC_SITE_URL=${siteUrl}
`;
    
    // Escribir archivo .env
    await fs.writeFile(envPath, envContent);
    console.log('\n✅ Archivo .env creado exitosamente');
    
    // Crear carpetas necesarias
    const foldersToCreate = [
      'logs',
      'public/uploads',
      'public/images'
    ];
    
    for (const folder of foldersToCreate) {
      const folderPath = path.join(rootDir, folder);
      await fs.mkdir(folderPath, { recursive: true });
    }
    console.log('✅ Carpetas necesarias creadas');
    
    // Actualizar configuración de WhatsApp en los archivos JSON
    const configPath = path.join(rootDir, 'public/config.json');
    const ecommerceConfigPath = path.join(rootDir, 'public/ecommerce-config.json');
    
    // Actualizar config.json
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    config.social.whatsapp = whatsappNumber;
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    // Actualizar ecommerce-config.json
    const ecommerceConfig = JSON.parse(await fs.readFile(ecommerceConfigPath, 'utf8'));
    ecommerceConfig.store.whatsappNumber = whatsappNumber;
    await fs.writeFile(ecommerceConfigPath, JSON.stringify(ecommerceConfig, null, 2));
    
    console.log('✅ Archivos de configuración actualizados');
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\nPróximos pasos:');
    console.log('1. Ejecuta: npm install');
    console.log('2. Ejecuta: npm run build');
    console.log('3. Ejecuta: npm start');
    console.log('\nCredenciales de admin por defecto:');
    console.log('Usuario: admin');
    console.log('Contraseña: bloomadmin2024');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña del admin después del primer inicio de sesión.');
    
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
  } finally {
    rl.close();
  }
}

setup();