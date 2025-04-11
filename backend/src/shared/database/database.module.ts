import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsManager } from 'aws-sdk';
import { ConfigModule, ConfigService } from '@nestjs/config';


// Solución temporal para el error de crypto
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto as any;
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secretsManager = new SecretsManager({
          region: 'us-east-1',
          endpoint: 'http://localhost:4566',
          credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
        });

        const secret = await secretsManager.getSecretValue({
          SecretId: 'my-db-secret'
        }).promise();


        const secretString = secret.SecretString as string;
       
        let dbConfig: any = {};
        // Primero intenta parsear como JSON estándar
        try {
          dbConfig = JSON.parse(secretString);
        } catch (e) {
          // Si falla, convierte el formato no estándar a JSON válido
          const fixedJson = secretString
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')  // Agrega comillas a claves
            .replace(/:\s*([a-zA-Z0-9_\\\/\.]+)(\s*[,}])/g, ': "$1"$2') // Agrega comillas a valores
            .replace(/\\\\/g, '\\');
            
            dbConfig = JSON.parse(fixedJson);
        }

        // Verifica las propiedades mínimas requeridas
        if (!dbConfig.host || !dbConfig.username || !dbConfig.password || !dbConfig.database) {
          throw new Error('Missing required database configuration in secret');
        }

        return {
          type: 'mssql',
          host: 'IL_DIAVOLO', // Usa doble barra o barra simple
          username: 'sa',
          password: 'Testlocal',
          database: 'ProductManagement',
          options: {
            encrypt: false,
            trustServerCertificate: true, // Necesario para desarrollo
            instanceName: 'SQLEXPRESS' // Especifica el nombre de instancia
          },
          connectionTimeout: 30000, // Aumenta timeout
          requestTimeout: 30000,
          pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
          }
        };

      }
    })
  ]
})

export class DatabaseModule {}