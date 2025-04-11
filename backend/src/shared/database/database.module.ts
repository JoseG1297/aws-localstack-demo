import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
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
        });


        const secretString = secret.SecretString || '';
       
        let dbConfig: any = {};
        // Primero intenta parsear como JSON estándar
        try {
          dbConfig = JSON.parse(secretString);
        } catch (e) {
          // Si falla, convierte el formato no estándar a JSON válido
          const fixedJson = secretString
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')  // Agrega comillas a claves
            .replace(/:\s*([a-zA-Z0-9_\\\/\.]+)(\s*[,}])/g, ': "$1"$2') // Agrega comillas a valores
            .replace(/\\\\/g, '\\'); // Reduce las barras escapadas

            dbConfig = JSON.parse(fixedJson);
        }

        // Verifica las propiedades mínimas requeridas
        if (!dbConfig.host || !dbConfig.username || !dbConfig.password || !dbConfig.database) {
          throw new Error('Missing required database configuration in secret');
        }

        return {
          type: 'mssql',
          ... dbConfig,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false,
          options: {
            encrypt: false,
            trustedConnection: false
          }
        }

      }
    })
  ]
})

export class DatabaseModule {}