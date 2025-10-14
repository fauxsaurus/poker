export type IICard = number

/**
 * @note Used for displaying non-shuffled decks to showcase future deck art variants.
 * fake cards will use decimals and thus not be pure integers
 */
export const createDeck = (jokers = 0): IICard[] => {
	const size = 52 + jokers
	const deck: IICard[] = []

	for (let i = 0; i < size; i++) deck.push(i)

	return deck
}

export const shuffleDeck = (oldDeck: IICard[]): IICard[] => {
	const newDeck = oldDeck.slice()

	// @note [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
	for (let i = newDeck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
	}

	return newDeck
}

export const isFakeCard = (card: IICard) => !Number.isInteger(card)

/** @note lowest to highest */
const CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const
/** @todo make this a variable for traditional spanish suits */
const CARD_SUITS = ['clubs', 'diamonds', 'hearts', 'spades'] as const

export const CARD_SUIT_ICONS = {
	clubs: '♣',
	diamonds: '♦',
	hearts: '♥',
	spades: '♠',
} as const

/** @todo handle jokers */
export const card2rank = (card: IICard) => CARD_RANKS[card % 13]
/** @todo handle jokers */
export const card2suit = (card: IICard) => CARD_SUITS[~~(card / 13)]
