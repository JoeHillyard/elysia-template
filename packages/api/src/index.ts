import {Elysia} from 'elysia'
import {cors} from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import {logger} from "@bogeychan/elysia-logger";
import {UploadController} from "./controllers/upload.controller";
import {AuthController} from "./controllers/auth.controller";

const PORT = parseInt(import.meta.env.PORT || '3000')

export const app = new Elysia()
	.use(swagger({path: '/api-docs'}))
	.use(cors())
	.use(logger({level: "error"}))
	.use(AuthController)
	.use(UploadController)
	.state({visitor: 0})
	.trace(async ({onHandle, onAfterHandle, id}) => {
		void onHandle(({begin, onStop}) => {
			onStop(({end}) => {
				console.log('handle took', end - begin, 'ms')
			})
		})
		void onAfterHandle(({begin, onStop}) => {
			onStop(({end}) => {
				console.log('handle took', end - begin, 'ms')
			})
		})
	})
	.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

export type App = typeof app
