import {Elysia, NotFoundError, t} from 'elysia'
import {eq} from 'drizzle-orm'
import {db} from '../db/db' // Assume this is your drizzle db instance
import {attribute, CardSelectSchema, deck, deckAttribute, gameSession, playerState} from '../db/schema'
import {TopTrumpsGame} from "../games/top-trumps.game";


type Deck = typeof deck.$inferSelect & {
	cards: CardSelectSchema[]
	attributes: (typeof deckAttribute.$inferSelect & {
		attribute: typeof attribute.$inferSelect
	})[]
}

export interface GameState {
	sessionId: string
	deck: Deck
	players: Map<string, WebSocket>
	currentTurn: string | null
	round: number
	cards: Map<string, CardSelectSchema[]>
}

const WS_TYPES = {
	JOIN_GAME: 'join_game',
	START_GAME: 'start_game',
	SELECT_ATTRIBUTE: 'select_attribute',
	ROUND_RESULT: 'round_result',
	GAME_OVER: 'game_over',
	ERROR: 'error'
} as const


const activeGames = new Map<string, TopTrumpsGame>()


export const GameServerController = new Elysia({prefix: 'game'})
	.post('/create', async ({body}) => {
			console.log(body.deckId)
			const gameDeck = await db.query.deck.findFirst({
				where: eq(deck.id, body.deckId),
				with: {
					cards: true,
					attributes: {
						with: {
							attribute: true
						}
					}
				}
			})

			if (!gameDeck) {
				throw new NotFoundError('Deck not found')
			}

			// Create game session
			const [session] = await db.insert(gameSession).values({
				deckId: body.deckId,
				status: 'waiting',
				gameState: {},
				minPlayers: 2,
				maxPlayers: 4
			}).returning()

			// Initialize game instance
			const game = new TopTrumpsGame(session.id, gameDeck)
			activeGames.set(session.id, game)

			return session
		},
		{
			body: t.Object({deckId: t.String()})
		}
	)
	// WebSocket handling
	.ws('/:sessionId', {
		body: t.Object({
			type: t.Union([
				t.Literal('join_game'),
				t.Literal('start_game'),
				t.Literal('select_attribute'),
				t.Literal('round_result'),
				t.Literal('game_over'),
				t.Literal('error')
			]),
			payload: t.Any()
		}),
		async open(ws) {
			console.log(ws.data)
			const sessionId = ws.data.params.sessionId
			const session = await db.query.gameSession.findFirst({
				where: eq(gameSession.id, sessionId)
			})

			if (!session) {
				ws.send({type: WS_TYPES.ERROR, payload: 'Game session not found'})
				ws.close()
				return
			}

			if (!activeGames.has(sessionId)) {

				const gameDeck = await db.query.deck.findFirst({
					where: eq(deck.id, session.deckId),
					with: {
						cards: true,
						attributes: {
							with: {
								attribute: true
							}
						}
					}
				})

				if (!gameDeck) {
					ws.send({type: WS_TYPES.ERROR, payload: 'Game deck not found'})
					ws.close()
					return
				}

				const game = new TopTrumpsGame(sessionId, gameDeck)
				activeGames.set(sessionId, game)
			}
		},
		async message(ws, message) {

			const sessionId = ws.data.params.sessionId
			const game = activeGames.get(sessionId)

			if (!game) {
				ws.send({type: WS_TYPES.ERROR, payload: 'Game not found'})
				return
			}
			console.log(message.type)

			switch (message.type) {
				case WS_TYPES.JOIN_GAME:

					console.log(game.players.entries())

					const playerCount = game.addPlayer(message.payload.playerId, ws)
					console.log('playerCount', playerCount)

					await db.insert(playerState).values({
						sessionId,
						userId: message.payload.playerId,
						order: playerCount,
						status: 'ready'
					})

					if (playerCount >= 2) {

						console.log(game.players.entries())
						await game.dealCards()

						for (const [playerId, playerWs] of game.players.entries()) {
							playerWs.send({
								type: WS_TYPES.START_GAME,
								payload: {
									cards: game.cards.get(playerId),
									currentTurn: game.currentTurn,
									attributes: game.deck.attributes
								}
							})
						}
					}
					break

				case WS_TYPES.SELECT_ATTRIBUTE:
					if (message.payload.playerId !== game.currentTurn) {
						ws.send({type: WS_TYPES.ERROR, payload: 'Not your turn'})
						return
					}

					const {roundCards, winningPlayer} = await game.compareCards(message.payload.attributeId)

					if (!winningPlayer) {
						ws.send({type: WS_TYPES.ERROR, payload: 'Could not determine winner'})
						return
					}

					const cardsToTransfer = Array.from(roundCards.values()).map(rc => rc.card)
					game.transferCards(winningPlayer, cardsToTransfer)

					if (game.isGameOver()) {
						const winner = game.getWinner()

						if (winner) {
							await db.update(gameSession)
								.set({
									status: 'completed',
									winnerId: winner
								})
								.where(eq(gameSession.id, sessionId))

							for (const playerWs of game.players.values()) {
								playerWs.send({
									type: WS_TYPES.GAME_OVER,
									payload: {winner}
								})
							}
						}

						activeGames.delete(sessionId)
					} else {
						game.currentTurn = winningPlayer
						game.round++

						for (const playerWs of game.players.values()) {
							playerWs.send({
								type: WS_TYPES.ROUND_RESULT,
								payload: {
									roundCards,
									winner: winningPlayer,
									nextTurn: winningPlayer,
									round: game.round
								}
							})
						}
					}
					break
			}
		},
		async close(ws) {
			const sessionId = ws.data.params.sessionId
			const game = activeGames.get(sessionId)

			if (game) {
				for (const [playerId, playerWs] of game.players.entries()) {
					if (playerWs === ws) {
						game.players.delete(playerId)
						break
					}
				}

				if (game.players.size < 2) {
					await db.update(gameSession)
						.set({status: 'abandoned'})
						.where(eq(gameSession.id, sessionId))

					activeGames.delete(sessionId)

					for (const playerWs of game.players.values()) {
						playerWs.send({
							type: WS_TYPES.GAME_OVER,
							payload: {reason: 'Player disconnected'}
						})
					}
				}
			}
		}
	})