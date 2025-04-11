import { SecretsManager } from 'aws-sdk';

export class SecretsManagerProvider {
  private secretsManager: SecretsManager;

  constructor() {
    this.secretsManager = new SecretsManager({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
    });
  }

  async getSecretValue(secretName: string): Promise<string> {
    try {
      const data = await this.secretsManager.getSecretValue({ SecretId: secretName }).promise();
      if ('SecretString' in data) {
        return data.SecretString as string;
      } else {
        throw new Error('Secret is not a string');
      }
    } catch (error) {
      console.error('Error retrieving secret:', error);
      throw error;
    }
  }
}