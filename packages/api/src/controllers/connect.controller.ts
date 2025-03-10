import {Elysia, t} from "elysia";
import {db} from "../db/db";
import {user, userConnection, userConnectionSelectSchema} from "../db/schema";
import { eq } from "drizzle-orm";

export const ConnectController = new Elysia({prefix: 'connect'})

	.get('/:userId', async ({params}) => {
		return db.query.userConnection.findMany({
			where: (userConnection, {eq, or}) => or(
				eq(userConnection.senderId, params.userId),
				eq(userConnection.recipientId, params.userId)
			),
			with: {
				sender: true,
				recipient: true
			}
		})
	}, {
		params: t.Object({
			userId: t.String()
		}),
		response: t.Array(userConnectionSelectSchema)
	})

	.post('/', async ({body}) => {

		const recipientUser = await db.query.user.findFirst({
			where: eq(user.email, body.recipientEmail)
		})

		if(!recipientUser){
			return
		}

		await db.insert(userConnection).values({
			recipientId: recipientUser.id,
			senderId: body.senderId
		})
	}, {
		body: t.Object({
			senderId: t.String(),
			recipientEmail: t.String()
		})
	})
