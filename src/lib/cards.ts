export type IInt = number

/** @note Used for displaying non-shuffled decks to showcase future deck art variants. */
export const createDeck = (jokers = 0): IInt[] => {
	const size = 52 + jokers
	const deck: IInt[] = []

	for (let i = 0; i < size; i++) deck.push(i)

	return deck
}

export const shuffleDeck = (oldDeck: IInt[]): IInt[] => {
	const newDeck = oldDeck.slice()

	// @note [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
	for (let i = newDeck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
	}

	return newDeck
}
