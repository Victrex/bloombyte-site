# 🧁 Bloom & Bite - Roles de Canela Artesanales

Sistema de e-commerce completo para Bloom & Bite, una tienda de roles de canela artesanales en Honduras. Incluye landing page, catálogo de productos, carrito de compras y panel de administración.

## 🚀 Características

### Para Clientes
- **Landing Page** moderna y atractiva con animaciones GSAP
- **Catálogo de Productos** con filtros por categoría y búsqueda
- **Carrito de Compras** persistente con localStorage
- **Sistema de Pedidos** vía WhatsApp
- **View Transitions** para navegación suave
- **Diseño Responsive** optimizado para móviles

### Para Administradores
- **Panel de Administración** protegido con autenticación JWT
- **Gestión de Productos**: Crear, editar, eliminar productos
- **Gestión de Órdenes**: Ver y actualizar estado de pedidos
- **Dashboard** con estadísticas en tiempo real
- **Gestión de Categorías** y productos destacados

## 🛠️ Tecnologías

- **Framework**: Astro 4.0 con SSR
- **Estilos**: Tailwind CSS
- **Animaciones**: GSAP
- **Base de Datos**: MySQL
- **Estado**: Nanostores
- **Componentes Interactivos**: React
- **Autenticación**: JWT + bcrypt
- **Servidor**: Node.js

## 📋 Requisitos

- Node.js 18.x o superior
- MySQL 5.7 o superior
- NPM o Yarn

## 🔧 Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/bloom-bite.git
cd bloom-bite
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Configurar la base de datos**
```bash
# Crear base de datos MySQL
# Las tablas se crean automáticamente al iniciar
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Acceder al sitio**
- Sitio web: http://localhost:4321
- Admin: http://localhost:4321/admin/login
  - Usuario: `admin`
  - Contraseña: `bloomadmin2024`

## 📁 Estructura del Proyecto

```
bloom-bite/
├── public/
│   ├── config.json          # Configuración principal
│   └── ecommerce-config.json # Configuración del e-commerce
├── src/
│   ├── components/          # Componentes Astro y React
│   ├── layouts/            # Layouts principales
│   ├── lib/                # Utilidades y conexión DB
│   ├── models/             # Modelos de datos
│   ├── pages/              # Páginas y rutas
│   │   ├── api/           # Endpoints API
│   │   ├── admin/         # Páginas de administración
│   │   ├── catalogo.astro # Catálogo de productos
│   │   └── index.astro    # Landing page
│   ├── stores/             # Estado global con Nanostores
│   └── middleware/         # Middleware de autenticación
├── .env.example            # Variables de entorno ejemplo
├── astro.config.mjs        # Configuración de Astro
├── package.json
├── tailwind.config.cjs
└── README.md
```

## 🎨 Personalización

### Colores
Edita `public/config.json`:
```json
"colors": {
  "primary": "#E6B8A2",
  "secondary": "#8B5A2B",
  "accent": "#FFE4E1"
}
```

### Productos
Los productos se gestionan desde el panel de administración o directamente en la base de datos.

### Contenido
Modifica los textos en `public/config.json` y `public/ecommerce-config.json`.

## 📱 Funcionalidades del Carrito

- Agregar/eliminar productos
- Actualizar cantidades
- Persistencia en localStorage
- Cálculo de envío automático
- Integración con WhatsApp

## 🔐 Seguridad

- Autenticación JWT para admin
- Contraseñas hasheadas con bcrypt
- Validación de entrada en formularios
- Headers de seguridad configurados
- Protección CSRF

## 🚀 Despliegue

Ver [INSTRUCCIONES_HOSTINGER.md](./INSTRUCCIONES_HOSTINGER.md) para guía completa de despliegue en Hostinger.

### Rápido para otros servicios:

```bash
# Construir para producción
npm run build

# Vista previa local
npm run preview

# Iniciar servidor de producción
npm start
```

## 📊 Base de Datos

### Tablas principales:
- **products**: Catálogo de productos
- **orders**: Órdenes de clientes
- **admin_users**: Usuarios administradores

### Migraciones:
Las tablas se crean automáticamente al iniciar la aplicación.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- Email: infobloombite@gmail.com
- WhatsApp: +504XXXXXXXX
- Instagram: @bloom_bitehn

## 📄 Licencia

Este proyecto es privado y propiedad de Bloom & Bite.

---

Hecho con ❤️ en Honduras