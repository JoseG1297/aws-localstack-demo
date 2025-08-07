# localstack-demo
# verificar si has instalado AWS CLI


# Iniciar LocalStack
docker-compose up -d

# Crear Bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

# Crear secrets conexion base de datos
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret `
--name ChallengerDB `
--secret-string '{\"name\":\"nameDB\",\"Port\":\"1433\",\"Hostname\":\"lcoalhost/SQLEXPRESS\",\"Username\":\"sa\",\"Password\":\"Testlocal\",\"Database\":\"db_test\"}'


# Verificar creación:
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets


# Crear un User Pool de Cognito
# Crear user pool
aws cognito-idp create-user-pool --pool-name MyUserPool --endpoint-url http://localhost:9229

# Obtener user pool creadors
aws cognito-idp list-user-pools --max-results 10 --endpoint-url http://localhost:9229

# Anota el ID del User Pool de la respuesta (ej: "Id": "us-east-1_abcdefg")

# Crear un App Client
aws cognito-idp create-user-pool-client --user-pool-id <UserPoolId> --client-name MyAppClient --endpoint-url http://localhost:9229

# Obtener app client creadors
aws cognito-idp list-user-pool-clients --user-pool-id <UserPoolId> --endpoint-url http://localhost:9229

# Anota el ID del App Client de la respuesta (ej: "ClientId": "1234567890abcdefghijklmnop")

# Registrar un usuario
aws cognito-idp admin-create-user --user-pool-id <UserPoolId> --username myuser --user-attributes Name=email,Value=myuser@example.com --endpoint-url http://localhost:9229

# Eliminar User Pool
aws --endpoint-url=http://localhost:9229 cognito-idp delete-user-pool --user-pool-id us-east-1_abc123xyz