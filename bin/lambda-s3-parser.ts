#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaS3ParserStack } from '../lib/lambda-s3-parser-stack';
import { environmentVariables } from '../lib/utils';

const app = new cdk.App();
new LambdaS3ParserStack(app, 'LambdaS3ParserStack', {
  env: {
    account: environmentVariables.AWS_ACCOUNT_ID,
    region: environmentVariables.AWS_REGION,
  },
});
