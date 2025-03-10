import {Elysia, t} from "elysia";
import {db} from "../db/db";
import {GCSPlugin} from "../plugins/gcs.plugin";

export const UploadController = new Elysia({prefix: '/upload'})
	.decorate('db', db)
	.use(GCSPlugin)
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
	.post('/file', async function ({body, error, createBucket, uploadFile}) {
		try {

			const file = body.file;
			console.log(file);

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
