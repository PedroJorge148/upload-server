import { randomUUID } from 'crypto'
import multer from 'fastify-multer'
import { extname, resolve } from 'path'
import { Options } from 'fastify-multer/lib/interfaces'
import multerS3 from 'multer-s3'

import { s3Config } from '../lib/aws-s3'
import { env } from '../env'

export const uploadFolder = resolve(__dirname, '../../tmp/uploads')

interface MulterConfig extends Options {
  directory: string
  storage: any // eslint-disable-line
}

const storageTypes = {
  local: multer.diskStorage({
    destination: uploadFolder,
    filename: (_, file, cb) => {
      const fileId = randomUUID()

      const extesion = extname(file.originalname)
      file.filename = fileId.concat(extesion)

      return cb(null, file.filename)
    },
  }),
  s3: multerS3({
    s3: s3Config,
    bucket: env.BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (_, file, cb) => {
      const fileId = randomUUID()

      const extesion = extname(file.originalname)
      const fileName = fileId.concat(extesion)

      return cb(null, fileName)
    },
  }),
}

const multerConfig: MulterConfig = {
  directory: uploadFolder,
  storage: storageTypes[env.STORAGE_TYPE],
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
  fileFilter: (_, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif',
      'image/svg',
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type.'))
    }
  },
}

export default multerConfig
