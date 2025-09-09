import {createDeck} from './cards'

const deckLengthStandard = 52
const deckLengthJoker = 54
describe('Create Deck', () => {
	const actualDeckStandard = createDeck()
	const actualDeckJoker = createDeck(2)

	it('Standard deck has 52 cards', () =>
		expect(actualDeckStandard).toHaveLength(deckLengthStandard))

	it('Joker deck has 54 cards', () => expect(actualDeckJoker).toHaveLength(deckLengthJoker))

	it('Cards are in order', () => {
		expect(actualDeckStandard[0]).toBe(0)
		expect(actualDeckStandard.every((int, i, array) => (array[i - 1] ?? -1) + 1 === int)).toBe(
			true
		)
	})
})

