# Scripts de Automatización AWS LocalStack Demo

Este conjunto de scripts automatiza el levantamiento y configuración de los servicios AWS LocalStack para desarrollo local.

## Scripts Disponibles

### 🚀 `start-services.sh`
**Descripción:** Levanta todos los servicios y los configura automáticamente.

**¿Qué hace?**
- Levanta los contenedores Docker (Cognito y LocalStack)
- Configura Secrets Manager con el secret `ChallengerDB`
- Configura Secrets Manager con el secret `OriginacionDB`
- Configura Secrets Manager con el secret `FloatControlDB`
- Crea un User Pool en Cognito
- Crea un App Client para autenticación
- Crea un usuario de prueba (`testuser`)
- Guarda toda la configuración en `.env.local`

**Uso:**
```bash
chmod +x start-services.sh
./start-services.sh
```

### 🧪 `test-services.sh`
**Descripción:** Prueba que todos los servicios estén funcionando correctamente.

**¿Qué hace?**
- Verifica que Secrets Manager esté funcionando
- Prueba la conexión con Cognito
- Verifica la autenticación de usuario
- Lista los usuarios existentes
- Muestra el estado general de los servicios

**Uso:**
```bash
chmod +x test-services.sh
./test-services.sh
```

### 🛑 `stop-services.sh`
**Descripción:** Detiene todos los servicios y limpia archivos temporales.

**¿Qué hace?**
- Detiene los contenedores Docker
- Elimina archivos de configuración temporal
- Muestra el estado final de los contenedores

**Uso:**
```bash
chmod +x stop-services.sh
./stop-services.sh
```

## Flujo Recomendado

1. **Iniciar servicios:**
   ```bash
   ./start-services.sh
   ```

2. **Verificar funcionamiento:**
   ```bash
   ./test-services.sh
   ```

3. **Desarrollar tu aplicación** usando las credenciales de `.env.local`

4. **Detener servicios al terminar:**
   ```bash
   ./stop-services.sh
   ```

## Configuración Generada

Después de ejecutar `start-services.sh`, encontrarás un archivo `.env.local` con:

```env
# AWS LocalStack Configuration
LOCALSTACK_URL=http://localhost:4566
COGNITO_URL=http://localhost:9229

# Cognito Configuration
USER_POOL_ID=us-east-1_xxxxxxxxx
APP_CLIENT_ID=xxxxxxxxxxxxxxxxx

# Database Secret
SECRET_NAME=ChallengerDB

# Test User
TEST_USERNAME=testuser
TEST_PASSWORD=Password123
TEST_EMAIL=test@example.com
```

## URLs de Servicios

- **LocalStack:** http://localhost:4566
- **Cognito Local:** http://localhost:9229
- **Secrets Manager:** Via LocalStack endpoint

## Datos de Prueba

### Usuario de prueba:
- **Username:** `testuser`
- **Password:** `Password123`
- **Email:** `test@example.com`

### Secret de base de datos:
- **Nombre:** `ChallengerDB`
- **Contenido:** Credenciales de conexión a SQL Server local

## Troubleshooting

### Si los scripts fallan:
1. Verifica que Docker esté corriendo
2. Asegúrate de que los puertos 4566 y 9229 estén disponibles
3. Espera unos segundos más para que los servicios inicien completamente

### Para reiniciar desde cero:
```bash
./stop-services.sh
./start-services.sh
```

### Verificar logs de contenedores:
```bash
docker-compose logs cognito
docker-compose logs localstack
```