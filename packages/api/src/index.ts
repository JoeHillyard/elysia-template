import {Context, Elysia} from 'elysia'
import {cors} from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';
import {UploadController} from "./controllers/upload.controller";
import {AuthController} from "./controllers/auth.controller";
import {auth} from "./auth";
import { OpenAPI } from './auth/openapi';

const PORT = parseInt(import.meta.env.PORT || '3000')

const betterAuthView = (context: Context & { request: Request }) => {
	const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
	// validate request method
	if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
		return auth.handler(context.request);
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		context.error(405);
	}
};

export const app = new Elysia()
	.use(swagger({
		path: 'api-docs',
		documentation: {
			components: await OpenAPI.components,
			paths: await OpenAPI.getPaths()
		}
	}))
	.use(cors({
		origin: 'http://localhost:3000',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization']
	}))
	.use(AuthController)
	.use(UploadController)
	.all("/auth/api/*", betterAuthView)
	.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

export type App = typeof app
