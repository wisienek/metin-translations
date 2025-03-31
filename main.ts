import {
  AwsConfig,
  getStaticConfig,
  S3LambdaClient,
  SqsConfig,
  SQSManager,
  SQSQueue,
} from './src';

const awsConfig = getStaticConfig(AwsConfig);
const sqsConfig = getStaticConfig(SqsConfig);
const s3Client = new S3LambdaClient(awsConfig);
const sqsManager = new SQSManager(awsConfig, sqsConfig);

export const handler = async (payload) =>
  internalHandler(exposeSQSMessage(payload));

const internalHandler = async (payload: object) => {
  if (isAcceptablePayload(payload)) {
    try {
      const payloadHandler = await initializePayloadHandler();

      await payloadHandler.handleOrchestratorPayload(
        await normalizer.normalize(payload),
      );
    } catch (error) {
      console.log(`Unhandled error occurred! See DLQ!`);
      console.error(error);

      await sqsManager.sendMessage(
        {
          payload,
          error,
        },
        SQSQueue.DEAD_LETTER,
      );
    }
  } else {
    console.log(`Received unacceptable payload. Sending to DLQ`);
    await sqsManager.sendMessage(payload, SQSQueue.DEAD_LETTER);
  }
};
