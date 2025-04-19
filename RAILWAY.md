# Configuración en Railway

## Variables de Entorno

Para que la aplicación funcione correctamente en Railway, es necesario configurar las siguientes variables de entorno:

### Variables Requeridas

- **DATABASE_URL**: URL de conexión a la base de datos MySQL. 
  - Formato: `mysql://username:password@hostname:port/database`
  - Ejemplo: `mysql://root:password@localhost:3306/voleibol_db`

- **JWT_SECRET**: Clave secreta para firmar tokens JWT.
  - Ejemplo: `mi_clave_secreta_muy_segura`

### Variables Opcionales

- **JWT_EXPIRATION**: Tiempo de expiración de tokens JWT (por defecto: 1h).
- **FRONTEND_URL**: URL del frontend para CORS (por defecto: http://localhost:3000).
- **NODE_ENV**: Entorno de ejecución (development, production).
- **PORT**: Puerto para el servidor (Railway asigna este valor automáticamente).

## Cómo configurar las variables en Railway

1. Accede a tu proyecto en [Railway](https://railway.app/dashboard).
2. Ve a la pestaña "Variables".
3. Haz clic en "+ New Variable".
4. Añade cada variable con su valor correspondiente.
5. Haz clic en "Deploy" para aplicar los cambios.

![Railway Variables](https://railway.app/assets/docs/variables.png)

## Importante

- No uses el formato `${{shared.VARIABLE}}` en Railway, simplemente define las variables directamente.
- Asegúrate de que la base de datos MySQL esté accesible desde Railway.
- Si estás usando una base de datos en Railway, puedes usar la variable `${DATABASE_URL}` que Railway proporciona automáticamente.