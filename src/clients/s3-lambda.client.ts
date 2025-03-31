import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'node:stream';
import {
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  S3LambdaClientOptions,
  PutFileStreamOptions,
  PipeToS3Options,
  S3ObjectOptions,
  ObjectMetadata,
  Option,
} from './typings';

export class S3LambdaClient {
  private s3: S3Client;
  constructor({ region }: S3LambdaClientOptions) {
    this.s3 = new S3Client({ region });
  }

  public async getObjectReadableStream({
    bucket,
    key,
  }: S3ObjectOptions): Promise<Option<Readable>> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.s3.send(command);

    // In Node.js environment Body field is of type Readable (from node:stream)
    return Option.wrap(response.Body as Readable);
  }

  /**
   * @deprecated use ```uploadStream()``` instead
   */
  public async writeObjectViaStream({
    bucket,
    key,
    fileStream,
    contentType,
  }: PutFileStreamOptions): Promise<void> {
    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  /**
   * @description Pipes content from passed stream to S3 object.
   * Be aware that this method does not preserve object's metadata.
   * To preserve metadata use `pipeToS3PreservingMetadata()` method
   */
  public pipeToS3(
    contentStream: Readable,
    { bucket, key, contentType }: PipeToS3Options,
  ) {
    return new Upload({
      client: this.s3,
      queueSize: 2,
      params: {
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: contentStream,
      },
    });
  }

  /**
   * @description Pipes content from passed stream to S3 object but
   * before doing so it saves current object metadata.
   */
  public async pipeToS3PreservingMetadata(
    contentStream: Readable,
    { bucket, key, contentType }: PipeToS3Options,
  ) {
    const metadata = (await this.getResourceMetadata(bucket, key)).unwrap();
    return new Upload({
      client: this.s3,
      queueSize: 2,
      params: {
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        Body: contentStream,
        Metadata: metadata ?? {},
      },
    });
  }
  /**
   *
   * @deprecated Use `getResourceHead` instead
   */
  public async getResourceMetadata(
    bucket: string,
    key: string,
  ): Promise<Option<ObjectMetadata>> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.s3.send(command);
    return Option.wrap(response.Metadata);
  }

  public async getResourceHead(
    bucket: string,
    key: string,
  ): Promise<HeadObjectCommandOutput> {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return this.s3.send(command);
  }
}
