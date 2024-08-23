import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { join } from 'path';

export class LambdaS3ParserStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket to store CSV files
    const bucket = new s3.Bucket(this, 'csvBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda function and respective logs to parse CSV files
    const functionName = 'parseCsv';

    const logGroup = new logs.LogGroup(this, `${functionName}LogGroup`, {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // The Lambda function's role with logging permissions
    const lambdaRole = new iam.Role(this, `${functionName}Role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        logging: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              resources: [logGroup.logGroupArn],
            }),
          ],
        }),
      },
    });

    const lambdaFn = new lambdaNode.NodejsFunction(
      this,
      `${functionName}Function`,
      {
        entry: join(
          import.meta.dirname,
          '..',
          'functions',
          `${functionName}.ts`,
        ),
        memorySize: 1024,
        timeout: cdk.Duration.minutes(5),
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_20_X,
        role: lambdaRole,
        logGroup,
        bundling: {
          format: lambdaNode.OutputFormat.ESM,
          platform: 'node',
          banner: `const require = (await import('node:module')).createRequire(import.meta.url);`,
        },
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      },
    );

    bucket.grantRead(lambdaFn);
  }
}
