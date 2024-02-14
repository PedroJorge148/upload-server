import { randomUUID } from 'crypto'
import multer from 'fastify-multer'
import { extname, resolve } from 'path'
import { Options } from 'fastify-multer/lib/interfaces'

const uploadFolder = resolve(__dirname, '../../tmp/uploads')

interface MulterConfig extends Options {
  directory: string
}

const multerConfig: MulterConfig = {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename: (_, file, cb) => {
      const fileId = randomUUID()

      const extesion = extname(file.originalname)
      const fileName = fileId.concat(extesion)

      return cb(null, fileName)
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
  fileFilter: (_, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif']

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type.'))
    }
  },
}

export default multerConfig
