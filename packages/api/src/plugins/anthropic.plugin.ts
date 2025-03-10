import {Elysia} from "elysia";
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({apiKey: process.env.ANTHROPIC_KEY})

type GenerateBody = {messages: {content: any, role: 'assistant' | 'user'}[]}

export const AnthropicPlugin = new Elysia({name: 'anthropic'})

	.decorate('generate', async (body: GenerateBody) => {
		try {
			const {messages} = body

			const formattedMessages = [
				{
					role: 'assistant' as const,
					content: `
						
					`
				},
				...messages.map(msg => ({
					role: msg.role,
					content: JSON.stringify(msg.content)
				}))
			]

			const response = await anthropic.messages.create({
				model: 'claude-3-5-sonnet-20241022',
				max_tokens: 8192,
				messages: formattedMessages
			})
1
			const parsed = JSON.parse(response.content[0].text)

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
	})