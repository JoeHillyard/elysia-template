import {Elysia, t} from "elysia";
import {db} from "../db/db";
import {gcsPlugin} from "../plugins/gcs.plugin";
import {card, deck} from "../db/schema";
import {eq} from "drizzle-orm";

export const UploadController = new Elysia({prefix: '/upload'})
	.decorate('db', db)
	.use(gcsPlugin)
	.post('/bucket', async function ({body, error, createBucket, uploadFile}) {
		try {
			await createBucket({bucketName: body.bucketName})
		} catch (e) {
			console.error(e);
			return error(500)
		}
	}, {
		body: t.Object({bucketName: t.String()})
	})
	.post('/deck', async function ({body, error, createBucket, uploadFile}) {
		try {

			const file = body.file;

			await createBucket({bucketName: body.bucketName})

			return await uploadFile({
				bucketName: body.bucketName,
				file,
				title: body.title,
			})

		} catch (e) {
			console.error(e);
			return error(500)
		}
	}, {
		body: t.Object({
			bucketName: t.String(),
			title: t.String(),
			file: t.File()
		})
	})
	.post('/card', async function ({db, body, error, uploadFile}) {
		try {

			const file = body.file;

			return await uploadFile({
				bucketName: body.bucketName,
				file,
				title: body.title,
			})

		} catch (e) {
			console.error(e);
			return error(500)
		}
	}, {
		body: t.Object({
			bucketName: t.String(),
			title: t.String(),
			file: t.File()
		})
	})
	.put('/deck', async function ({db, body, error, uploadFile}) {
		try {

			const file = body.file;

			const {url} = await uploadFile({
				bucketName: body.deckId,
				file,
				title: body.title,
			})

			await db.update(deck)
				.set({imageUrl: url})
				.where(eq(deck.id, body.deckId))

		} catch (e) {
			console.error(e);
			return error(500)
		}
	}, {
		body: t.Object({
			deckId: t.String({format: 'uuid'}),
			title: t.String(),
			file: t.File()
		})
	})
	.put('/card', async function ({db, body, error, uploadFile}) {
		try {

			const file = body.file;

			const {url} = await uploadFile({
				bucketName: body.deckId,
				file,
				title: body.title,
			})

			await db.update(card)
				.set({imageUrl: url})
				.where(eq(deck.id, body.cardId))

		} catch (e) {
			console.error(e);
			return error(500)
		}
	}, {
		body: t.Object({
			deckId: t.String({format: 'uuid'}),
			cardId: t.String({format: 'uuid'}),
			title: t.String(),
			file: t.File()
		})
	})
