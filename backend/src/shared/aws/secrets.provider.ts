import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export const SecretsManagerProvider = {
  provide: 'SECRETS_MANAGER',
  useFactory: () => {
    return new SecretsManagerClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566', // LocalStack endpoint
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    });
  }
};