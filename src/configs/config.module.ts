import { ClassConstructor } from 'class-transformer';
import { AwsConfig, AwsEnv } from './aws';
import { SqsConfig, SqsEnv } from './sqs';

const CONFIGS = {
  [AwsConfig.name]: AwsEnv,
  [SqsConfig.name]: SqsEnv,
};

export function getStaticConfig<T>(config: ClassConstructor<T>): T {
  const configEnv = CONFIGS[config.name];
  return new config(configEnv());
}
