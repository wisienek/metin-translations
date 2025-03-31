import { S3ObjectOptions } from './s3-object-options';

export interface PipeToS3Options extends S3ObjectOptions {
  contentType: string;
}
