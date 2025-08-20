# Dashboard de Gestión de Costos Odoo

Una aplicación web completa para la gestión masiva de costos de productos integrada con Odoo. Permite visualizar, editar y sincronizar costos de productos de manera eficiente.

## Características

- 🔄 **Sincronización bidireccional con Odoo** - Importa productos y categorías, exporta cambios de costos
- 📊 **Dashboard informativo** - Vista general del estado del sistema y estadísticas
- 🛍️ **Gestión de productos** - Visualización de productos con filtros por categoría
- ✏️ **Edición individual** - Modificación manual de costos producto por producto  
- 📦 **Actualización masiva** - Cambio de costos por categoría completa
- 📋 **Historial completo** - Registro detallado de todos los cambios realizados
- 🔄 **Control de sincronización** - Gestión de cambios pendientes y sincronizados

## Estructura del Proyecto

```
act-costos-odoo/
├── backend/                    # API REST con Express.js
│   ├── database/              # Base de datos SQLite
│   ├── models/                # Modelos de datos
│   ├── routes/                # Rutas de la API
│   ├── services/              # Servicios (integración Odoo)
│   └── server.js              # Servidor principal
├── frontend/                   # Interfaz React con TypeScript
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # Cliente API
│   │   └── types.ts          # Tipos TypeScript
│   └── package.json
└── package.json               # Scripts principales
```

## Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd act-costos-odoo
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
Copia el archivo `.env.example` a `.env` en el directorio `backend/`:
```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tu configuración de Odoo:
```env
ODOO_URL=https://tu-instancia-odoo.com
ODOO_DATABASE=tu_base_de_datos
ODOO_USERNAME=tu_usuario@email.com
ODOO_API_KEY=tu_clave_api
PORT=3001
```

4. **Ejecutar la aplicación**
```bash
npm run dev
```

Esto iniciará:
- Backend en http://localhost:3001
- Frontend en http://localhost:3000

## Uso

### Primera configuración

1. **Probar conexión con Odoo**
   - Ve al Dashboard y haz clic en "Probar Conexión Odoo"
   - Verifica que la conexión sea exitosa

2. **Sincronizar datos iniciales**
   - En el Dashboard, haz clic en "Sincronizar Datos desde Odoo"
   - Esto importará todas las categorías y productos

### Funcionalidades principales

#### Dashboard
- Vista general de estadísticas (productos, categorías, cambios pendientes)
- Acciones rápidas para probar conexión y sincronizar datos
- Estado del sistema en tiempo real

#### Gestión de Productos
- **Filtrado**: Por categoría y búsqueda por nombre/código
- **Edición individual**: Clic en el ícono de edición para cambiar el costo de un producto
- **Actualización masiva**: Selecciona una categoría y aplica un nuevo costo a todos sus productos
- **Información detallada**: ID Odoo, código, nombre, categoría y fecha de última actualización

#### Historial de Cambios
- Registro completo de todas las modificaciones
- Filtros por estado de sincronización y categoría
- Distinción entre cambios manuales y masivos
- Información de costos anteriores y nuevos

#### Sincronización
- **Importar desde Odoo**: Actualiza la base de datos local con datos de Odoo
- **Exportar a Odoo**: Sincroniza cambios de costos realizados en la aplicación
- **Estado de conexión**: Herramientas de diagnóstico
- **Vista de cambios pendientes**: Lista detallada de modificaciones no sincronizadas

### Flujo de trabajo típico

1. **Importar datos** desde Odoo (página de Sincronización)
2. **Revisar productos** en la página de Productos
3. **Realizar cambios** de costos (individuales o masivos)
4. **Verificar cambios** en el Historial
5. **Sincronizar a Odoo** cuando estés listo

## API Endpoints

### Productos
- `GET /api/products` - Obtener productos (con filtro opcional por categoría)
- `GET /api/products/category/:categoryId` - Productos por categoría
- `PUT /api/products/:odooId/cost` - Actualizar costo individual
- `PUT /api/products/category/:categoryId/cost` - Actualización masiva por categoría

### Categorías
- `GET /api/categories` - Obtener todas las categorías
- `GET /api/categories/with-counts` - Categorías con conteo de productos
- `GET /api/categories/:odooId` - Obtener categoría específica

### Cambios
- `GET /api/changes` - Historial de cambios (con filtros)
- `GET /api/changes/pending-sync` - Cambios pendientes de sincronizar
- `POST /api/changes/sync-to-odoo` - Sincronizar cambios a Odoo

### Odoo
- `GET /api/odoo/test-connection` - Probar conexión con Odoo
- `POST /api/odoo/sync/products` - Importar productos desde Odoo
- `POST /api/odoo/sync/categories` - Importar categorías desde Odoo

## Base de Datos

La aplicación utiliza SQLite para almacenamiento local con las siguientes tablas:

- **products**: Información de productos sincronizada desde Odoo
- **categories**: Categorías de productos
- **cost_changes**: Registro de todos los cambios de costos realizados

## Tecnologías Utilizadas

### Backend
- Node.js con Express.js
- SQLite para base de datos
- Axios para integración con Odoo API
- CORS para manejo de peticiones cross-origin

### Frontend
- React 18 con TypeScript
- Material-UI para componentes de interfaz
- React Query para gestión de estado y caché
- React Router para navegación
- Axios para comunicación con API

## Configuración de Odoo

Para usar esta aplicación necesitas:

1. **API Key de Odoo**: Genera una clave API en tu perfil de usuario
2. **Permisos adecuados**: El usuario debe tener permisos para leer y escribir productos y categorías
3. **Acceso XML-RPC**: Asegúrate de que tu instancia de Odoo permita conexiones XML-RPC

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

Si encuentras problemas:

1. Verifica la configuración de conexión con Odoo
2. Revisa los logs del servidor backend
3. Asegúrate de tener los permisos correctos en Odoo
4. Verifica que tu instancia de Odoo sea accesible

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.