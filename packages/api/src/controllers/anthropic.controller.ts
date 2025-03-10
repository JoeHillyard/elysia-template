import {Elysia, t} from "elysia";
import Anthropic from '@anthropic-ai/sdk'
import {AnthropicPlugin} from "../plugins/anthropic.plugin";

const anthropic = new Anthropic({
	apiKey: process.env.ANTHROPIC_KEY
})


const AttributeDefinition = t.Object({
	name: t.String(),
	minValue: t.Number(),
	maxValue: t.Number()
})

const AttributeWithValue = t.Intersect([
	AttributeDefinition,
	t.Object({
		value: t.Number()
	})
])

const Card = t.Object({
	name: t.String(),
	description: t.String(),
	attributes: t.Array(t.Object({
		name: t.String(),
		value: t.Number()
	}))
})

const CardSystem = t.Object({
	attributes: t.Array(AttributeDefinition),
	cards: t.Array(Card)
})

export const CardSystemSchema = CardSystem

const GameConfig = t.Object({
	name: t.String(),
	description: t.String(),
	imageUrl: t.String({ format: 'uri-reference' }),  // Allows empty string
	isPublic: t.Boolean(),
	cardCount: t.Number({ minimum: 0, maximum: 1000 }),  // Added reasonable limits
	minPlayers: t.Number({ minimum: 1, maximum: 6 }),  // Added reasonable limits
	maxPlayers: t.Number({ minimum: 1, maximum: 6 })
})

export const AnthropicController = new Elysia({prefix: 'anthropic'})
	.use(AnthropicPlugin)
	.post('/review', async ({body}) => {
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
	.post('/generate', async ({body, generate}) => {
		try {

			return generate(body)

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
					content: GameConfig
				})
			)
		}),
		response: t.Object({message: CardSystemSchema})
	})