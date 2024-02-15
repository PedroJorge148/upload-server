import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  STORAGE_TYPE: z.enum(['local', 's3']),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_DEFAULT_REGION: z.string(),
  BUCKET_NAME: z.string(),
})

export const env = envSchema.parse(process.env)
