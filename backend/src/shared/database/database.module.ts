import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

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

        const { host, username, password, database, port } = JSON.parse(secret.SecretString);

        return {
          type: 'mssql',    
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true,
          options: {
            encrypt: false,
            trustServerCertificate: true // Para desarrollo local
          }
        };
      }
    })
  ]
})
export class DatabaseModule {}