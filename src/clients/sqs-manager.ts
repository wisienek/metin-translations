import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { AwsConfig, SqsConfig } from '../configs';
import { SQSQueue } from './typings';

export class SQSManager {
  private client: SQSClient;

  constructor(awsConfig: AwsConfig, private sqsConfig: SqsConfig) {
    this.client = new SQSClient({
      ...awsConfig,
      endpoint: sqsConfig.endpointURL,
    });
  }

  public async sendMessage(message: string | object, queue: SQSQueue) {
    const command = new SendMessageCommand({
      MessageBody:
        typeof message === 'string' ? message : JSON.stringify(message),
      QueueUrl: this.resolveQueueURL(queue),
      MessageGroupId: queue === SQSQueue.DEAD_LETTER ? undefined : 'default',
    });
    await this.client.send(command);
  }

  private resolveQueueURL(queue: SQSQueue) {
    switch (queue) {
      case SQSQueue.DEAD_LETTER:
        return this.sqsConfig.deadLetterQueue;
      default:
        throw new Error(`Unknown SQS queue "${queue}"`);
    }
  }
}
