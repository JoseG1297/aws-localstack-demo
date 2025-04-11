import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

import { Module } from '@nestjs/common';
import { SecretsManagerProvider } from '../aws/secrets.provider';
import { TypeOrmModule } from '@nestjs/typeorm';


// Solución temporal para el error de crypto
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto as any;
}

@Module({})
export class DatabaseModule {
  static async forRootAsync(): Promise<any> {
    const secretsProvider = new SecretsManagerProvider();

    const dbSecrets = await secretsProvider.getSecretValue('my-db-secret');
    // const dbConfig = JSON.parse(dbSecrets);

    return{
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          name: 'testConection',
          type: 'mssql',
          host: 'DESKTOP-483GBIT/SQLEXPRESS',
          username: 'sa',
          password: 'Testlocal',
          database: 'ProductManagement',
          schema:'dbo',
          synchronize: false,
          extra: {
            trustServerCertificate: true,
            encrypt: false,
          },
        })
      ]
    };
  }
}