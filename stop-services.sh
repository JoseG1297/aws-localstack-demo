#!/bin/bash

echo "🛑 Deteniendo servicios AWS LocalStack Demo..."

echo "📦 Deteniendo contenedores Docker..."
docker-compose down

echo "🧹 Limpiando archivos temporales..."
if [ -f ".env.local" ]; then
    rm .env.local
    echo "✅ Archivo .env.local eliminado"
fi

echo "🗂️  Estado de contenedores:"
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E '(cognito|localstack)' || echo "  No hay contenedores corriendo"

echo -e "\n✅ Servicios detenidos exitosamente"