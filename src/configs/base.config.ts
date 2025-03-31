export type ConfigType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer ReturnVal
  ? ReturnVal extends Promise<infer AsyncReturnVal>
    ? AsyncReturnVal
    : ReturnVal
  : any;

export abstract class BaseConfig {
  protected abstract env: ConfigType<any>;
}
