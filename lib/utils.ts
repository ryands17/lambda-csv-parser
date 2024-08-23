import { z } from 'zod';

export const environmentVariables = z
  .object({
    AWS_ACCOUNT_ID: z.string(),
    AWS_REGION: z.string().default('eu-west-1'),
  })
  .parse(process.env);
