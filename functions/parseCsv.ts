import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parse } from '@fast-csv/parse';
import { Handler } from 'aws-lambda';
import { z } from 'zod';
import { Readable } from 'stream';

const EnvironmentVariablesSchema = z.object({
  AWS_REGION: z.string(),
  BUCKET_NAME: z.string(),
});

const client = new S3Client();

export const handler: Handler = async () => {
  const items: any = [];
  const environmentVariables = EnvironmentVariablesSchema.parse(process.env);

  const command = new GetObjectCommand({
    Bucket: environmentVariables.BUCKET_NAME,
    Key: 'test-csv.csv',
  });

  const response = await client.send(command);

  if (response.Body instanceof Readable) {
    const csvStream = response.Body.pipe(parse({ headers: true }));
    for await (const row of csvStream) {
      items.push(row);
    }
  }

  console.log(JSON.stringify(items, null, 2));
};
