import { _SqsEnv, SqsEnv } from './sqs.env';
import { BaseConfig } from '../base.config';

export class SqsConfig extends BaseConfig {
  constructor(
    protected env: _SqsEnv,
  ) {
    super();
  }

  get deadLetterQueue() {
    return this.env.SQS_DEAD_LETTER_QUEUE_URL;
  }

  get endpointURL() {
    return this.env.SQS_ENDPOINT_URL;
  }
}
