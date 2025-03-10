import jwt from "@elysiajs/jwt"
import {Elysia} from "elysia";

export const authPlugin = new Elysia()
	.use(
		jwt({
			name: 'jwt',
			secret: process.env.JWT_SECRET!,
		})
	)
	.derive(({ headers, jwt }) => {

		return {
			getCurrentUser: async () => {
				const authHeader = headers.authorization
				if (!authHeader?.startsWith('Bearer ')) {
					throw new Error('Missing or invalid authorization header')
				}

				const token = authHeader.split(' ')[1]
				if (!token) {
					throw new Error('Missing token')
				}

				try {
					const payload = await jwt.verify(token)
					if (!payload) {
						throw new Error('Invalid token')
					}

					return payload
				} catch (error) {
					throw new Error('Invalid token')
				}
			}
		}
	})
	.onBeforeHandle(async ({ getCurrentUser }) => {
		await getCurrentUser()
	})