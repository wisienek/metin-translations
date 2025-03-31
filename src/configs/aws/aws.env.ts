import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { validateUtil } from '../validate.util';

export class _AwsEnv {
  @IsString()
  @Expose()
  REGION: string;
}

export const AwsEnv = () => validateUtil(process.env, _AwsEnv);
