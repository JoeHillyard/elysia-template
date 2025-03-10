import {client, otherClient} from "./client.ts";
import type {LoaderFunctionArgs} from "react-router";


export const clientLoader = async ({params}: LoaderFunctionArgs) => {
	if(!params.id) return null
	return (await otherClient.id({id: params.id}).get()).data
}

export const edenLoader = (fn: (utils: ReturnType<typeof client.useUtils>) =>
	(args: LoaderFunctionArgs) => Promise<void>) =>
	(utils: ReturnType<typeof client.useUtils>) =>
		async (args: LoaderFunctionArgs) => {
			try {
				await fn(utils)(args)
				return null
			} catch (error) {
				console.error('Loader error:', error)
				return null
			}
		}