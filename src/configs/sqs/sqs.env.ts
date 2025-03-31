import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { validateUtil } from '../validate.util';

export class _SqsEnv {
  @IsString()
  @Expose()
  SQS_DEAD_LETTER_QUEUE_URL = 'N/A';

  @IsString()
  @Expose()
  SQS_ENDPOINT_URL = 'https://sqs.eu-central-1.amazonaws.com/';
}

export const SqsEnv = () => validateUtil(process.env, _SqsEnv);
