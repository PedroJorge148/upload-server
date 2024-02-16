import fastify from 'fastify'
import { appRoutes } from './routes/appRoutes'
import fastifyMultipart from '@fastify/multipart'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import { uploadFolder } from './config/upload'

export const app = fastify()

app.register(fastifyStatic, {
  root: uploadFolder,
  prefix: '/tmp/uploads',
})

app.register(fastifyMultipart)
app.register(fastifyCors)

app.register(appRoutes)
