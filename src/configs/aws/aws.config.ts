import { _AwsEnv, AwsEnv } from './aws.env';
import { BaseConfig } from '../base.config';

export class AwsConfig extends BaseConfig {
  constructor(protected env: _AwsEnv) {
    super();
  }

  get region() {
    return this.env.REGION;
  }
}
