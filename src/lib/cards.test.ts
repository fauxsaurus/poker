import {createDeck, shuffleDeck, type IInt} from './cards'

const deckLengthStandard = 52
const deckLengthJoker = 54

/** @returns Boolean (indicating if the array contents are in sequential order) */
const isDeckInOrder = (int: IInt, i: IInt, array: IInt[]) => (array[i - 1] ?? -1) + 1 === int

const actualDeckStandard = createDeck()

describe('Create Deck', () => {
	const actualDeckJoker = createDeck(2)

	it('Standard deck has 52 cards', () =>
		expect(actualDeckStandard).toHaveLength(deckLengthStandard))

	it('Joker deck has 54 cards', () => expect(actualDeckJoker).toHaveLength(deckLengthJoker))

	it('Cards are in order', () => {
		expect(actualDeckStandard[0]).toBe(0)
		expect(actualDeckStandard.every(isDeckInOrder)).toBe(true)
	})
})

describe('Shuffle deck', () => {
	const unshuffledDeck = actualDeckStandard.slice()
	const shuffledDeck = shuffleDeck(unshuffledDeck)

	it('Cards in random order', () => {
		expect(shuffledDeck.join(',')).not.toBe(unshuffledDeck.join(','))
	})
})
