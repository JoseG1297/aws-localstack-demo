# localstack-demo
# verificar si has instalado AWS CLI


# Iniciar LocalStack
docker-compose up -d

# Crear Bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://my-bucket

# Crear secrets conexion base de datos
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret `
--name my-db-secret `
--secret-string '{\"name\":\"testConection\",\"type\":\"mssql\",\"host\":\"localhost/SQLEXPRESS\",\"username\":\"sa\",\"password\":\"Testlocal\",\"database\":\"ProductManagement\",\"schema\":\"dbo\"}'

# Verificar creación:
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets
