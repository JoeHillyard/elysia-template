import {Elysia, t} from "elysia";
import Anthropic from '@anthropic-ai/sdk'
import {AnthropicPlugin} from "../plugins/anthropic.plugin";

const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_KEY})

export const AnthropicController = new Elysia({prefix: 'anthropic'})
	.use(AnthropicPlugin)
	.post('/review', async ({body, store}) => {
		try {
			const {messages} = body

			const formattedMessages = [
				{
					role: 'assistant' as const,
					content: `
						You will receive some JSON data that describes the metadata for a top trumps game - provide insight on the balance, fairness and playability of the deck and respond in the format of:
							
						{feedback: string[]}
					`
				},
				...messages.map(msg => ({
					role: msg.role,
					content: msg.content
				}))
			]

			const response = await anthropic.messages.create({
				model: 'claude-3-5-haiku-20241022',
				max_tokens: 2048,
				messages: formattedMessages
			})

			const parsed = JSON.parse(response.content[0].text) as {feedback: string[]}

			return {
				message: parsed
			}

		} catch (error) {
			console.error('Error calling Anthropic API:', error)
			return {
				message: '',
				error: 'Failed to get response from Claude'
			}
		}
	}, {
		body: t.Object({
			messages: t.Array(
				t.Object({
					role: t.String({default: 'user'}),
					content: t.String()
				})
			)
		}),
		response: t.Object({message: t.Object({feedback: t.Array(t.String())})})
	})