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
            SecretId: 'my-secret'
        });

        // Añade debug para inspeccionar la respuesta
        Logger.debug(`Secret raw response: ${JSON.stringify(secret)}`, 'DatabaseModule');

        // Verifica si SecretString existe
        if (!secret.SecretString) {
          throw new Error('SecretString is undefined in the response');
        }

        let dbConfig: any = {};
        try {
          dbConfig = JSON.parse(secret.SecretString);
        } catch (e) {
          Logger.error(`Failed to parse secret: ${secret.SecretString}`, e.stack, 'DatabaseModule');
          throw new Error('Invalid secret JSON format');
        }

        // Verifica las propiedades mínimas requeridas
        if (!dbConfig.host || !dbConfig.username || !dbConfig.password || !dbConfig.database) {
          throw new Error('Missing required database configuration in secret');
        }

        return {
          type: 'postgres',
          ... dbConfig,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          options: {
            encrypt: false,
            trustServerCertificate: true // Para desarrollo local
          }
        }

      }
    })
  ]
})
export class DatabaseModule {}