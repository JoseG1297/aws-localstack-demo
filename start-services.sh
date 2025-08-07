#!/bin/bash

echo "🚀 Iniciando servicios AWS LocalStack Demo..."

echo "📦 Levantando contenedores Docker..."
docker-compose up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo "🔧 Configurando Secrets..."
echo " ChallengerDB..."
curl -X POST http://localhost:4566/ \
  -H "X-Amz-Target: secretsmanager.CreateSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{
    "Name": "ChallengerDB",
    "SecretString": "{\"name\":\"ChallengerDB\",\"Port\":\"1433\",\"Hostname\":\"localhost/SQLEXPRESS\",\"Username\":\"sa\",\"Password\":\"Testlocal\",\"Database\":\"chalenger_test\"}"
  }'

echo -e "\n✅ Secret 'ChallengerDB' creado exitosamente"

echo " FloatControlDB..."
curl -X POST http://localhost:4566/ \
  -H "X-Amz-Target: secretsmanager.CreateSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{
    "Name": "FloatControlDB",
    "SecretString": "{\"name\":\"FloatControlDB\",\"Port\":\"1433\",\"Hostname\":\"localhost/SQLEXPRESS\",\"Username\":\"sa\",\"Password\":\"Testlocal\",\"Database\":\"provident_test\"}"
  }'

echo -e "\n✅ Secret 'FloatControlDB' creado exitosamente"

echo " OriginacionDB..."
curl -X POST http://localhost:4566/ \
  -H "X-Amz-Target: secretsmanager.CreateSecret" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{
    "Name": "OriginacionDB",
    "SecretString": "{\"name\":\"OriginacionDB\",\"Port\":\"1433\",\"Hostname\":\"localhost/SQLEXPRESS\",\"Username\":\"sa\",\"Password\":\"Testlocal\",\"Database\":\"Originacion_test\"}"
  }'

echo -e "\n✅ Secret 'OriginacionDB' creado exitosamente"

echo "👥 Configurando Cognito User Pool..."

USER_POOL_RESPONSE=$(curl -s -X POST http://localhost:9229/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.CreateUserPool" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{
    "PoolName": "MyNoVerificationPool",
    "AutoVerifiedAttributes": [],
    "AdminCreateUserConfig": {
        "AllowAdminCreateUserOnly": false
    },
    "Policies": {
        "PasswordPolicy": {
            "MinimumLength": 6,
            "RequireUppercase": false,
            "RequireLowercase": false,
            "RequireNumbers": false,
            "RequireSymbols": false
        }
    },
    "Schema": [
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        }
    ]
  }')

USER_POOL_ID=$(echo $USER_POOL_RESPONSE | grep -o '"Id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_POOL_ID" ]; then
    echo "❌ Error: No se pudo obtener el User Pool ID"
    exit 1
fi

echo "✅ User Pool creado con ID: $USER_POOL_ID"

echo "📱 Creando App Client..."

APP_CLIENT_RESPONSE=$(curl -s -X POST http://localhost:9229/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.CreateUserPoolClient" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{
    \"UserPoolId\": \"$USER_POOL_ID\",
    \"ClientName\": \"MyAppClient\",
    \"GenerateSecret\": false,
    \"ExplicitAuthFlows\": [
        \"ALLOW_ADMIN_USER_PASSWORD_AUTH\",
        \"ALLOW_USER_PASSWORD_AUTH\",
        \"ALLOW_REFRESH_TOKEN_AUTH\"
    ]
  }")

CLIENT_ID=$(echo $APP_CLIENT_RESPONSE | grep -o '"ClientId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Error: No se pudo obtener el Client ID"
    exit 1
fi

echo "✅ App Client creado con ID: $CLIENT_ID"

echo "👤 Creando usuario de prueba..."

curl -s -X POST http://localhost:9229/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.AdminCreateUser" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{
    \"UserPoolId\": \"$USER_POOL_ID\",
    \"Username\": \"testuser\",
    \"TemporaryPassword\": \"TempPass123\",
    \"UserAttributes\": [
        {
            \"Name\": \"email\",
            \"Value\": \"test@example.com\"
        }
    ],
    \"MessageAction\": \"SUPPRESS\"
  }" > /dev/null

curl -s -X POST http://localhost:9229/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.AdminSetUserPassword" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{
    \"UserPoolId\": \"$USER_POOL_ID\",
    \"Username\": \"testuser\",
    \"Password\": \"Password123\",
    \"Permanent\": true
  }" > /dev/null

echo "✅ Usuario 'testuser' creado con contraseña: Password123"

echo "📝 Guardando configuración..."

cat > .env.local << EOF
# AWS LocalStack Configuration
LOCALSTACK_URL=http://localhost:4566
COGNITO_URL=http://localhost:9229

# Cognito Configuration
USER_POOL_ID=$USER_POOL_ID
APP_CLIENT_ID=$CLIENT_ID

# Database Secrets
SECRET_CHALLENGER_DB=ChallengerDB
SECRET_FLOAT_CONTROL_DB=FloatControlDB
SECRET_ORIGINACION_DB=OriginacionDB

# Test User
TEST_USERNAME=testuser
TEST_PASSWORD=Password123
TEST_EMAIL=test@example.com
EOF

echo -e "\n🎉 ¡Configuración completada exitosamente!"
echo -e "\n📋 Resumen de configuración:"
echo "  🐳 Docker Compose: Corriendo"
echo "  🗄️  LocalStack: http://localhost:4566"
echo "  🔐 Cognito: http://localhost:9229"
echo "  📊 User Pool ID: $USER_POOL_ID"
echo "  📱 App Client ID: $CLIENT_ID"
echo "  🗃️  Secrets creados: ChallengerDB, FloatControlDB, OriginacionDB"
echo "  👤 Usuario de prueba: testuser / Password123"
echo -e "\n🔧 Variables guardadas en: .env.local"
echo -e "\n🧪 Para probar la configuración, ejecuta:"
echo "  ./test-services.sh"