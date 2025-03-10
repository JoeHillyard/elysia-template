import {Elysia, Static, t} from "elysia";
import {db} from "../db/db";
import {
	card,
	cardAttributeValue,
	cardAttributeValueSelectSchema,
	cardCreateSchema,
	cardSelectSchema,
	deck,
	deckAttribute,
	deckAttributeSelectSchema,
	deckCreateSchema,
	deckSelectSchema,
	userDeck
} from "../db/schema";
import {eq, or} from "drizzle-orm";

const attrs = {
	attributes: deckAttributeSelectSchema
}

const FullDeckSchema = t.Composite([
	deckSelectSchema,
	t.Object(attrs),
	t.Object({
		cards: t.Composite([
			cardSelectSchema,
			t.Object({
				attributeValues: cardAttributeValueSelectSchema
			})
		])
	})
])

type FullDeck = Static<typeof FullDeckSchema>

export const DeckController = new Elysia({prefix: 'deck'})

	.get('/:deckId', async ({params: {deckId}}) => {
		return db.query.deck.findFirst({
			where: eq(deck.id, deckId),
			with: {
				attributes: true,
				cards: {
					with: {
						attributeValues: {
							with: {
								deckAttribute: true
							}
						}
					}
				}
			}
		});
	}, {
		params: t.Object({deckId: t.String()})
	})

	.get('/discover', async () => {
		const userId = 'aa87abfa-34b4-4580-a00f-fd607dea61ba'
		return await db.query.deck.findMany({
			where: (deck, {and, notExists, eq}) => and(
				// Only show public decks
				eq(deck.isPublic, true),
				// Filter out decks that are saved by the user
				notExists(
					db.select()
						.from(userDeck)
						.where(and(
							eq(userDeck.userId, userId),
							eq(userDeck.deckId, deck.id)
						))
				)
			),
			with: {
				creator: true,
				cards: {
					limit: 3
				}
			}
		});
	}, {
		response: t.Array(deckSelectSchema)
	})

	.get('/saved', async () => {
		const userId = 'aa87abfa-34b4-4580-a00f-fd607dea61ba'
		const resp = await db.query.deck.findMany({
			where: (deck, {and, exists, eq}) => or(
				// Only show public decks
				and(
					eq(deck.isPublic, false),
					eq(deck.creatorId, userId),
				),
				//eq(deck.isPublic, false),
				// Filter out decks that are saved by the user
				exists(
					db.select()
						.from(userDeck)
						.where(and(
							eq(userDeck.userId, userId),
							eq(userDeck.deckId, deck.id)
						))
				)
			),
			with: {
				creator: true,
				cards: true,
				userDecks: true
			}
		});
		return resp
	})

	.get('/detail', async ({}) => {
		return await db.query.deck.findMany({
			with: {
				attributes: true,
				cards: {
					with: {
						attributeValues: {
							with: {
								deckAttribute: true
							}
						}
					}
				}
			}
		});
	}, {
		response: t.Array(deckSelectSchema)
	})

	.post('/create', async function ({body}) {

		const {userId, gameId, deckFormat, attributes, cards} = body

		await db.transaction(async (tx) => {

			const [newDeck] = await tx.insert(deck).values({
				name: deckFormat.name,
				description: deckFormat.description,
				imageUrl: deckFormat.imageUrl,
				isPublic: deckFormat.isPublic,
				cardCount: deckFormat.cardCount,
				minPlayers: deckFormat.minPlayers,
				maxPlayers: deckFormat.maxPlayers,
				gameId: gameId,
				creatorId: userId,
				metadata: {}
			}).returning();

			// 2. Create attributes and deck attributes
			const attributePromises = attributes.map(async (attr, index) => {

				const [newDeckAttribute] = await tx.insert(deckAttribute).values({
					name: attr.name,
					type: 'number',
					deckId: newDeck.id,
					minValue: attr.minValue,
					maxValue: attr.maxValue,
					order: index,
					weight: 1,
					validation: {
						type: 'number',
						minimum: attr.minValue,
						maximum: attr.maxValue
					},
					metadata: {min: attr.minValue, max: attr.maxValue}
				}).returning();

				return newDeckAttribute
			});

			const deckAttributes = await Promise.all(attributePromises);

			// 3. Create cards and their attribute values
			const cardPromises = cards.map(async (cardData) => {
				// Create the card
				const [newCard] = await tx.insert(card).values({
					name: cardData.name,
					description: cardData.description,
					imageUrl: cardData.imageUrl,
					deckId: newDeck.id,
					metadata: {}
				}).returning();

				// Create card attribute values
				const attributeValuePromises = cardData.attributes.map(async (attr) => {
					const deckAttribute = deckAttributes.find(m => m.name === attr.name);
					if (!deckAttribute) throw new Error(`Attribute mapping not found for ${attr.name}`);

					// Transform the number to string here
					const valueAsString = typeof attr.value === 'number'
						? attr.value.toString()
						: attr.value;

					return tx.insert(cardAttributeValue).values({
						cardId: newCard.id,
						deckAttributeId: deckAttribute.id,
						value: valueAsString,
						metadata: {}
					});
				});

				await Promise.all(attributeValuePromises);
				return newCard;
			});

			await Promise.all(cardPromises);

			return newDeck;
		});

	}, {
		body: t.Object({
			userId: t.String(),
			gameId: t.String(),
			deckFormat: t.Omit(deckCreateSchema, [
				'gameId',
				'creatorId',
				'metadata'
			]),
			attributes: t.Array(t.Object({
				name: t.String(),
				minValue: t.Number(),
				maxValue: t.Number()
			})),
			cards: t.Array(
				t.Object({
					...t.Pick(cardCreateSchema, [
						'name',
						'description',
						'imageUrl'
					]).properties,
					attributes: t.Array(
						t.Object({
							value: t.Union([t.String(), t.Number()]),
							name: t.String()
						})
					)
				})
			)
		})
	})

	.post('/save', async function ({body, set}) {

		await db.insert(userDeck).values(body)

		set.status = 201
	}, {
		body: t.Object({
			userId: t.String({format: 'uuid'}),
			deckId: t.String({format: 'uuid'})
		})
	})

	.delete('/unsave', async function ({body, set}) {

		await db.delete(userDeck).where(eq(userDeck.id, body.userDeckId))

		set.status = 200
	}, {
		body: t.Object({
			userDeckId: t.String({format: 'uuid'})
		})
	})

