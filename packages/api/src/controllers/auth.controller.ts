import {Elysia, t} from "elysia";
import {db} from "../db/db";
import {eq} from "drizzle-orm";
import {users} from "../db/schemas";
import {JWTPlugin} from "../plugins/jwt-auth.guard";

export const AuthController = new Elysia({prefix: 'auth'})
	.use(JWTPlugin)
	.post('/register',
		async ({body, jwt}) => {

			const {email, password, ...rest} = body

			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, email)
			})

			if (existingUser) {
				throw new Error('User already exists')
			}

			const hashedPassword = await Bun.password.hash(password)

			const newUser = {email, password: hashedPassword, ...rest}

			const [createdUser] = await db.insert(users).values(newUser).returning()

			const token = await jwt.sign({userId: createdUser.id, email: createdUser.email})

			return {
				message: 'User registered successfully',
				access_token: token
			}
		},
		{
			body: t.Object({
				firstName: t.String(),
				lastName: t.String(),
				email: t.String({format: 'email'}),
				password: t.String({minLength: 8})
			}),
			response: t.Object({
				message: t.String(),
				access_token: t.String()
			})
		}
	)
	.post('/login',
		async ({body, jwt}) => {
			const {email, password} = body

			const foundUser = await db.query.users.findFirst({where: eq(users.email, email)})

			if (!foundUser) {
				throw new Error('Invalid credentials')
			}

			const isValidPassword = await Bun.password.verify(password, foundUser.password)

			if (!isValidPassword) {
				throw new Error('Invalid credentials')
			}

			const token = await jwt.sign({userId: foundUser.id, email: foundUser.email})

			return {
				message: 'Login successful',
				access_token: token
			}
		},
		{
			body: t.Object({
				email: t.String({format: 'email'}),
				password: t.String()
			}),
			response: t.Object({
				message: t.String(),
				access_token: t.String()
			})
		}
	)
	.post('/validate', async ({body, jwt}) => {
		const {token} = body

		const user = await jwt.verify(token) as { userId: string, email: string }

		return {
			user,
			is_valid: !!user
		}
	}, {
		body: t.Object({token: t.String()}),
		response: t.Object({
			is_valid: t.Boolean(),
			user: t.Object({userId: t.String(), email: t.String()})
		})
	})