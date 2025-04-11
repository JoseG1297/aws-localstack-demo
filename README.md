# localstack-demo
# verificar si has instalado AWS CLI


# Iniciar LocalStack
docker-compose up -d

# Crear Bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

# Crear secrets conexion base de datos
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name my-db-secret --secret-string '{"host":"IL_DIAVOLO\\\\SQLEXPRESS", "port":"1433", "username":"sa", "password":"Testlocal", "database":"ProductManagement"}'

aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name my-db-secret --secret-string '{ "username": "sa", "password": "Testlocal", "host": "IL_DIAVOLO/SQLEXPRESS", "port": "1433", "database": "ProductManagement","type": "mssql"}'

# Verificar creación:
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets
