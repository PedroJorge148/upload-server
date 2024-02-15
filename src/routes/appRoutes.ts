import { FastifyInstance } from 'fastify'
import multer from 'fastify-multer'
import { prisma } from '../lib/prisma'
import { File as FastifyFile } from 'fastify-multer/lib/interfaces'
import upload, { uploadFolder } from '../config/upload'
import z from 'zod'
import { s3Config } from '../lib/aws-s3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../env'
import { promisify } from 'util'
import fs from 'fs'

interface File extends FastifyFile {
  bucket: string
  key: string
  acl: string
  contentType: string
  contentDisposition: null
  storageClass: string
  serverSideEncryption: null
  location: string
  etag: string
}

declare module 'fastify' {
  interface FastifyRequest {
    file: File
  }
}

export async function appRoutes(app: FastifyInstance) {
  app.get('/uploads', async (_, reply) => {
    const uploads = await prisma.upload.findMany()

    return reply.send({ uploads })
  })

  app.post(
    '/uploads',
    { preHandler: multer(upload).single('file') },
    async (request, reply) => {
      const upload = request.file

      if (!upload) {
        return reply.status(400).send()
      }

      // console.log(upload)

      if (!upload.location) {
        const fullUrl = request.protocol.concat('://').concat(request.hostname)
        upload.location = fullUrl.concat(`/tmp/uploads/${upload.filename}`)
      }

      const file = await prisma.upload.create({
        data: {
          name: upload.originalname,
          key: upload.filename ?? upload.key,
          sizeInBytes: upload.size ?? 0,
          fileUrl: upload.location,
        },
      })

      return reply.status(201).send({ file })
    },
  )

  app.delete('/uploads/:id/delete', async (request, reply) => {
    const deleteUploadParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteUploadParams.parse(request.params)

    const upload = await prisma.upload.findUnique({
      where: {
        id,
      },
    })

    if (!upload) {
      return reply.status(400).send({ error: 'Resource not found.' })
    }

    if (env.STORAGE_TYPE === 's3') {
      await s3Config.send(
        new DeleteObjectCommand({
          Bucket: env.BUCKET_NAME,
          Key: upload.key,
        }),
      )
    } else {
      await promisify(fs.unlink)(uploadFolder.concat(`/${upload.key}`))
    }

    await prisma.upload.delete({
      where: {
        id,
      },
    })

    return reply.status(204).send()
  })
}
