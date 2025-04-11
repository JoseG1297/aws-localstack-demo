import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';

import { Module } from '@nestjs/common';
import { SecretsManagerProvider } from '../aws/secrets.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';


// Solución temporal para el error de crypto
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto as any;
}

@Module({})
export class DatabaseModule {
  static async forRootAsync(): Promise<any> {
    const secretsProvider = new SecretsManagerProvider();

    const dbSecrets = await secretsProvider.getSecretValue('my-db-secret-tres');
    
    Logger.log('dbSecrets', dbSecrets);
    let dbConfig: any = {};

    try {
      dbConfig = JSON.parse(dbSecrets);
      Logger.log('dbConfig', dbConfig);
    }
    catch (error) { 
      Logger.error('Error parsing dbConfig', error);
      const fixedJson = dbSecrets
            .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')  // Agrega comillas a claves
            .replace(/:\s*([a-zA-Z0-9_\\\/\.]+)(\s*[,}])/g, ': "$1"$2') // Agrega comillas a valores
            .replace(/\\\\/g, '\\');

          dbConfig = JSON.parse(fixedJson);  
      }


    return{
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          name: dbConfig.name,
          type: dbConfig.type,
          host: dbConfig.host,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          schema: dbConfig.schema,
          synchronize: false,
          entities: [User, Product], // Ruta global
          extra: {
            trustServerCertificate: true,
            encrypt: false,
          },
          logging: true,
          logger: 'advanced-console'
        })
      ]
    };
  }
}