import { FastifyInstance } from 'fastify'
import multer from 'fastify-multer'
import upload from '../config/upload'
import { prisma } from '../lib/prisma'

import { File } from 'fastify-multer/lib/interfaces'

declare module 'fastify' {
  export interface FastifyRequest {
    file: File
  }
}

export async function appRoutes(app: FastifyInstance) {
  app.post(
    '/upload',
    { preHandler: multer(upload).single('file') },
    async (request, reply) => {
      const upload = request.file

      if (!upload) {
        return reply.status(400).send()
      }

      console.log(upload)

      // const allowedMimes = [
      //   'image/jpeg',
      //   'image/pjpeg',
      //   'image/png',
      //   'image/gif',
      // ]

      // if (!allowedMimes.includes(upload.mimetype)) {
      //   return reply.status(400).send({ error: 'Invalid file type.' })
      // }

      const fullUrl = request.protocol.concat('://').concat(request.hostname)
      const fileUrl = new URL(
        `tmp/uploads/${upload.filename}`,
        fullUrl,
      ).toString()

      const file = await prisma.upload.create({
        data: {
          name: upload.originalname,
          key: upload.filename ?? '',
          sizeInBytes: upload.size ?? 0,
          fileUrl,
        },
      })

      return reply.send({ file })
    },
  )
}
