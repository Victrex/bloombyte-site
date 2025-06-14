# Instrucciones de Instalación en Hostinger

## Requisitos Previos

1. **Plan de Hosting**: Necesitas un plan que soporte Node.js (Business o superior)
2. **Base de datos MySQL**: Incluida en tu plan de Hostinger
3. **Acceso SSH**: Para ejecutar comandos en el servidor
4. **Dominio configurado**: Apuntando a tu servidor de Hostinger

## Paso 1: Preparar la Base de Datos

1. Accede a tu **cPanel de Hostinger**
2. Ve a la sección **Bases de datos** → **MySQL Databases**
3. Crea una nueva base de datos:
   - Nombre: `bloom_bite` (o el que prefieras)
4. Crea un nuevo usuario MySQL:
   - Usuario: `bloom_user`
   - Contraseña: (genera una segura)
5. Asigna todos los permisos del usuario a la base de datos

## Paso 2: Configurar Variables de Entorno

1. En cPanel, ve a **Avanzado** → **Variables de entorno**
2. Agrega las siguientes variables:

```bash
DB_HOST=localhost
DB_USER=bloom_user
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=bloom_bite
JWT_SECRET=genera-una-clave-segura-de-32-caracteres
PUBLIC_WHATSAPP_NUMBER=+50431618894
NODE_ENV=production
PUBLIC_SITE_URL=https://bloomybite.store
```

## Paso 3: Subir los Archivos

### Opción A: Usando Git (Recomendado)

1. Conecta por SSH a tu servidor:
```bash
ssh usuario@tuservidor.com
```

2. Navega a la carpeta public_html:
```bash
cd public_html
```

3. Clona tu repositorio:
```bash
git clone https://github.com/tu-usuario/bloom-bite.git .
```

### Opción B: Usando FTP

1. Usa FileZilla o el administrador de archivos de Hostinger
2. Sube todos los archivos a la carpeta `public_html`

## Paso 4: Instalar Dependencias

1. Conecta por SSH
2. Navega a tu directorio:
```bash
cd public_html
```

3. Instala las dependencias:
```bash
npm install
```

4. Construye el proyecto:
```bash
npm run build
```

## Paso 5: Configurar Node.js

1. En cPanel, ve a **Software** → **Setup Node.js App**
2. Crea una nueva aplicación:
   - Node.js version: 18.x o superior
   - Application mode: Production
   - Application root: public_html
   - Application URL: tudominio.com
   - Application startup file: dist/server/entry.mjs

3. Guarda la configuración

## Paso 6: Configurar el archivo .htaccess

Crea un archivo `.htaccess` en `public_html` con el siguiente contenido:

```apache
RewriteEngine On

# Redirigir todo el tráfico a Node.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# Headers de seguridad
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
```

## Paso 7: Configurar PM2 (Gestor de Procesos)

1. Instala PM2 globalmente:
```bash
npm install -g pm2
```

2. Crea un archivo `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'bloom-bite',
    script: './dist/server/entry.mjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. Inicia la aplicación:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Paso 8: Configurar Cron Jobs

1. En cPanel, ve a **Avanzado** → **Cron Jobs**
2. Agrega un cron job para reiniciar PM2 si falla:
   - Comando: `cd /home/usuario/public_html && pm2 resurrect`
   - Frecuencia: Cada 5 minutos

## Paso 9: Configurar SSL

1. En cPanel, ve a **Seguridad** → **SSL/TLS**
2. Instala un certificado SSL gratuito de Let's Encrypt
3. Fuerza HTTPS en todas las páginas

## Paso 10: Optimizaciones Finales

### Caché del navegador
Agrega esto a tu `.htaccess`:

```apache
# Caché del navegador
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access 1 year"
  ExpiresByType image/jpeg "access 1 year"
  ExpiresByType image/gif "access 1 year"
  ExpiresByType image/png "access 1 year"
  ExpiresByType text/css "access 1 month"
  ExpiresByType text/html "access 1 month"
  ExpiresByType application/pdf "access 1 month"
  ExpiresByType text/x-javascript "access 1 month"
  ExpiresByType application/javascript "access 1 month"
  ExpiresByType image/x-icon "access 1 year"
  ExpiresDefault "access 1 month"
</IfModule>
```

### Compresión Gzip
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## Solución de Problemas Comunes

### Error 500
- Verifica los logs en: `logs/error_log`
- Asegúrate de que Node.js esté configurado correctamente
- Verifica permisos de archivos (644 para archivos, 755 para carpetas)

### La base de datos no conecta
- Verifica que el host sea `localhost`
- Confirma que el usuario tenga permisos
- Prueba la conexión desde phpMyAdmin

### Las imágenes no cargan
- Crea una carpeta `uploads` en `public_html`
- Dale permisos 755
- Configura el límite de subida en PHP

### El sitio es lento
- Activa la caché de Hostinger
- Usa Cloudflare (gratuito)
- Optimiza las imágenes

## Mantenimiento

### Actualizar el sitio
```bash
cd public_html
git pull origin main
npm install
npm run build
pm2 restart bloom-bite
```

### Ver logs
```bash
pm2 logs bloom-bite
```

### Monitorear el sitio
```bash
pm2 monit
```

## Seguridad Adicional

1. **Cambia las credenciales por defecto** del admin inmediatamente
2. **Realiza backups regulares** de la base de datos
3. **Mantén Node.js actualizado**
4. **Configura un firewall** en Hostinger
5. **Usa contraseñas seguras** para todo

## Soporte

Si tienes problemas:
1. Revisa los logs de error
2. Contacta al soporte de Hostinger
3. Revisa la documentación de Astro: https://docs.astro.build/

¡Tu sitio de Bloom & Bite ya debería estar funcionando! 🎉