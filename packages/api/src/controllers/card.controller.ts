import {Elysia, t} from "elysia";
import {db} from "../db/db";
import {attribute, card, cardAttributeValue, cardCreateSchema, deckAttribute} from "../db/schema";

export const CardController = new Elysia({prefix: 'card'})

	.post('/', async function ({body}) {

		const {deckId, attributes, cards} = body

		await db.transaction(async (tx) => {

			const attributePromises = attributes.map(async (attr, index) => {

				const [newAttribute] = await tx.insert(attribute).values({
					name: attr.name,
					type: 'number',
					metadata: {min: attr.minValue, max: attr.maxValue},
					validation: {
						type: 'number',
						minimum: attr.minValue,
						maximum: attr.maxValue
					}
				}).returning();

				const [newDeckAttribute] = await tx.insert(deckAttribute).values({
					deckId: deckId,
					attributeId: newAttribute.id,
					minValue: attr.minValue,
					maxValue: attr.maxValue,
					order: index,
					weight: 1,
					metadata: {}
				}).returning();

				return {
					attributeId: newAttribute.id,
					deckAttributeId: newDeckAttribute.id,
					originalId: attr.name
				};
			});

			const attributeMapping = await Promise.all(attributePromises);

			const cardPromises = cards.map(async (cardData) => {

				const [newCard] = await tx.insert(card).values({
					name: cardData.name,
					description: cardData.description,
					imageUrl: cardData.imageUrl,
					deckId: deckId,
					metadata: {}
				}).returning();

				const attributeValuePromises = cardData.attributes.map(async (attr) => {

					const mapping = attributeMapping.find(m => m.originalId === attr.name);
					if (!mapping) throw new Error(`Attribute mapping not found for ${attr.name}`);

					const valueAsString = typeof attr.value === 'number'
						? attr.value.toString()
						: attr.value;

					return tx.insert(cardAttributeValue).values({
						cardId: newCard.id,
						deckAttributeId: mapping.deckAttributeId,
						value: valueAsString,
						metadata: {}
					});
				});

				await Promise.all(attributeValuePromises);
				return newCard;
			});

			await Promise.all(cardPromises);
		});
	}, {
		body: t.Object({
			deckId: t.String(),
			attributes: t.Array(t.Object({
				name: t.String(),
				minValue: t.Number(),
				maxValue: t.Number()
			})),
			cards: t.Array(t.Object({
				...t.Omit(cardCreateSchema, [
					'id',
					'deckId',
					'metadata',
					'rarity'
				]).properties,
				attributes: t.Array(t.Object({
					value: t.Union([t.String(), t.Number()]),
					name: t.String()
				}))
			}))
		})
	})

