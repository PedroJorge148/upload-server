import fastify from 'fastify'
import { appRoutes } from './routes/appRoutes'
import fastifyMultipart from '@fastify/multipart'

export const app = fastify()

app.register(fastifyMultipart)

app.register(appRoutes)
