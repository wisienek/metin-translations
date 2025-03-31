import { Readable } from 'node:stream';
import { S3ObjectOptions } from './s3-object-options';

export interface PutFileStreamOptions extends S3ObjectOptions {
  fileStream: Readable;
  contentType: string;
}
