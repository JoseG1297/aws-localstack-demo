#!/bin/bash

if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local no existe. Ejecuta primero ./start-services.sh"
    exit 1
fi

source .env.local

echo "🧪 Probando servicios AWS LocalStack Demo..."

echo -e "\n1️⃣ Probando Secrets Manager..."

# Probar ChallengerDB
SECRET_RESPONSE=$(curl -s -X POST $LOCALSTACK_URL/ \
  -H "X-Amz-Target: secretsmanager.GetSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId": "ChallengerDB"}')

if echo $SECRET_RESPONSE | grep -q "SecretString"; then
    echo "✅ ChallengerDB: OK"
else
    echo "❌ ChallengerDB: Error"
fi

# Probar FloatControlDB
SECRET_RESPONSE=$(curl -s -X POST $LOCALSTACK_URL/ \
  -H "X-Amz-Target: secretsmanager.GetSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId": "FloatControlDB"}')

if echo $SECRET_RESPONSE | grep -q "SecretString"; then
    echo "✅ FloatControlDB: OK"
else
    echo "❌ FloatControlDB: Error"
fi

# Probar OriginacionDB
SECRET_RESPONSE=$(curl -s -X POST $LOCALSTACK_URL/ \
  -H "X-Amz-Target: secretsmanager.GetSecretValue" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d '{"SecretId": "OriginacionDB"}')

if echo $SECRET_RESPONSE | grep -q "SecretString"; then
    echo "✅ OriginacionDB: OK"
else
    echo "❌ OriginacionDB: Error"
fi

echo -e "\n2️⃣ Probando Cognito User Pool..."
POOL_RESPONSE=$(curl -s -X POST $COGNITO_URL/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.DescribeUserPool" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{\"UserPoolId\": \"$USER_POOL_ID\"}")

if echo $POOL_RESPONSE | grep -q "UserPool"; then
    echo "✅ Cognito User Pool: OK"
    echo "   Pool ID: $USER_POOL_ID"
else
    echo "❌ Cognito User Pool: Error"
    echo "   Respuesta: $POOL_RESPONSE"
fi

echo -e "\n3️⃣ Probando App Client..."
CLIENT_RESPONSE=$(curl -s -X POST $COGNITO_URL/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.DescribeUserPoolClient" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{\"UserPoolId\": \"$USER_POOL_ID\", \"ClientId\": \"$APP_CLIENT_ID\"}")

if echo $CLIENT_RESPONSE | grep -q "UserPoolClient"; then
    echo "✅ App Client: OK"
    echo "   Client ID: $APP_CLIENT_ID"
else
    echo "❌ App Client: Error"
    echo "   Respuesta: $CLIENT_RESPONSE"
fi

echo -e "\n4️⃣ Probando autenticación de usuario..."
AUTH_RESPONSE=$(curl -s -X POST $COGNITO_URL/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{
    \"ClientId\": \"$APP_CLIENT_ID\",
    \"AuthFlow\": \"USER_PASSWORD_AUTH\",
    \"AuthParameters\": {
        \"USERNAME\": \"$TEST_USERNAME\",
        \"PASSWORD\": \"$TEST_PASSWORD\"
    }
  }")

if echo $AUTH_RESPONSE | grep -q "AccessToken"; then
    echo "✅ Autenticación: OK"
    echo "   Usuario autenticado: $TEST_USERNAME"
else
    echo "❌ Autenticación: Error"
    echo "   Respuesta: $AUTH_RESPONSE"
fi

echo -e "\n5️⃣ Listando usuarios..."
USERS_RESPONSE=$(curl -s -X POST $COGNITO_URL/ \
  -H "X-Amz-Target: AWSCognitoIdentityProviderService.ListUsers" \
  -H "Content-Type: application/x-amz-json-1.1" \
  -d "{\"UserPoolId\": \"$USER_POOL_ID\", \"Limit\": 10}")

USER_COUNT=$(echo $USERS_RESPONSE | grep -o '"Username"' | wc -l)
echo "✅ Usuarios en el pool: $USER_COUNT"

echo -e "\n🎉 Prueba completada"
echo -e "\n📊 Estado de servicios:"
echo "  🐳 Docker: $(docker ps --format 'table {{.Names}}' | grep -E '(cognito|localstack)' | wc -l) contenedores corriendo"
echo "  🗄️  LocalStack: $(curl -s http://localhost:4566/health | grep -q 'running' && echo 'OK' || echo 'Error')"
echo "  🔐 Cognito: $(curl -s http://localhost:9229 > /dev/null && echo 'OK' || echo 'Error')"