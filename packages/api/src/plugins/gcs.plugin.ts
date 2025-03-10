import {Storage} from "@google-cloud/storage";
import {Elysia} from "elysia";

const storage = new Storage({
	projectId: 'launchpad-402019',
	credentials: {
		client_email: 'cloud-storage@launchpad-402019.iam.gserviceaccount.com',
		private_key: process.env.GCS_KEY,
	}
});

type CreateBucket = {
	bucketName: string
}

type FileUpload = CreateBucket & {
	file: File;
	title: string
}

export const GCSPlugin = new Elysia({name: 'gcs'})
	.decorate('createBucket', async ({bucketName}: CreateBucket) => {

		const [bucket] = await storage.createBucket(bucketName)
		return bucket.name
	})
	.decorate('uploadFile', async ({bucketName, file, title}: FileUpload) => {

		const fileBuffer = await file.arrayBuffer();
		const bucket = storage.bucket(bucketName)

		await bucket.file(title)
			.save(Buffer.from(fileBuffer), {
				contentType: file.type,
				metadata: {originalName: title}
			});

		return {
			url: `https://storage.googleapis.com/${bucketName}/${title}`
		}
	})