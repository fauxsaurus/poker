import {useState} from 'react'
import './App.css'
import {
	card2rank,
	card2suit,
	CARD_SUIT_ICONS,
	createDeck,
	shuffleDeck,
	type IICard,
} from './lib/cards'

type IUUIDv4 = string
type ID = IUUIDv4

type ICard = IICard

type ITurn = {
	playerId: ID
	action: 'FOLD' | 'CALL' | 'RAISE' | 'SET BIG BLIND' | 'SET SMALL BLIND'
	amount: number
}

type IPlayer = {chips: number; hand: ICard[]; id: ID}
type IGameState = {
	communityCards: ICard[]
	blinds: {big: 0; small: 0}
	deck: ICard[]
	dealer: ID
	players: IPlayer[]
	turns: ITurn[]
	/*
"handId": "unique_hand_identifier",
"gameVariant": "No Limit Texas Hold'em",
"potSize": 150,
"players": [
{
	"playerId": "player_1_id",
	"name": "Alice",
	"stackSize": 950,
	"holeCards": ["Ah", "Kd"], // Only visible to the player and at showdown
	"currentBet": 20,
	"hasFolded": false,
	"isAllIn": false
},
*/
}

/** @note an empty id would indicate a spectator... perhaps that should be kept in a different UI component/view */
type IGameView = {
	currentPlayer: ID
}

const fillArray = <T,>(length: number, fn: (_: unknown, i: number, array: unknown[]) => T) =>
	Array(length).fill(1).map(fn)

const createPlayer = ({chips, id = crypto.randomUUID()}: {chips: number; id?: ID}): IPlayer => ({
	chips,
	hand: [],
	id,
})
/** @todo add configuration for more players/jokers */
const createGame = (config: {buyIn: number}): IGameState => {
	const players = fillArray(4, () => createPlayer({chips: config.buyIn}))
	const dealer = players[~~(Math.random() * 4)].id

	return {
		blinds: {big: 0, small: 0},
		communityCards: [],
		deck: shuffleDeck(createDeck()),
		dealer,
		players,
		turns: [],
	}
}

const isBettingDone = (game: IGameState) => {
	if (game.turns.length) return false

	const lastRaiseI = game.turns.findLastIndex(turn => turn.action === 'RAISE')
	const subArray = lastRaiseI === -1 ? game.turns : game.turns.slice(lastRaiseI)

	/** @todo need to filter out all players who folded... AND/OR have no $? */

	return subArray.length === game.players.length
}

// const dealCards = () => {

// }

const game2phase = (game: IGameState) => {
	if (!game.blinds.big || !game.blinds.small) return 'SETUP'
	if (!game.players.every(player => player.hand.length)) return 'SHUFFLE'

	const communityCardsNum = game.communityCards.length
	const bettingDone = isBettingDone(game)

	if (!communityCardsNum && !bettingDone) return 'PREFLOP'
	if ((bettingDone && !communityCardsNum) || communityCardsNum === 3) return 'FLOP'
	if ((bettingDone && communityCardsNum === 3) || communityCardsNum === 4) return 'TURN'
	if ((bettingDone && communityCardsNum === 4) || communityCardsNum === 5) return 'RIVER'

	throw new Error(
		'Todo Finish Implementing showdown by seeing how many players are still in the game!'
	)

	// showdown = prior round of betting has concluded && there is more than one player who has not folded
	// again? no pots remain on the table
}

/*
STATE
{
	// chipsType: int or a list of denominations and counts

	phase
	dealer playerId
	// smallBind (derrived)
	// bigBlind (derrived)
	// underTheGun (derrived)
	currentPlayer: playerId (bet raise, etc.) alt use a zip list of players to indicate this to derrive the active player
	players: {id, chips: chipsType, bet: chipsType, }[] // players are in clockwise order
	// hasFolded? (derrived by a bet of zero and them being to the right of the current player)
}

 */

type IRoles = 'Dealer' | 'Small Blind' | 'Big Blind' | 'Under the Gun'

const player2roles = (game: IGameState, playerId: ID): IRoles[number][] => {
	const totalPlayers = game.players.length
	const isDealer = game.dealer === playerId

	if (totalPlayers === 2)
		return isDealer ? ['Dealer', 'Small Blind', 'Under the Gun'] : ['Big Blind']

	if (totalPlayers === 3 && isDealer) return ['Dealer', 'Under the Gun']

	if (isDealer) return ['Dealer']

	const indexDealer = game.players.findIndex(player => player.id === game.dealer)
	let indexPlayer = game.players.findIndex(player => player.id === playerId)
	if (indexPlayer < indexDealer) indexPlayer += totalPlayers

	const seatsToTheLeftOfDealer = indexPlayer - indexDealer

	if (seatsToTheLeftOfDealer === 1) return ['Small Blind']
	if (seatsToTheLeftOfDealer === 2) return ['Big Blind']
	if (seatsToTheLeftOfDealer === 3) return ['Under the Gun']

	return []
}

/** @todo make currency configurable */

const config = {
	currency: {name: 'dollars', symbol: '$'},
	minBigBlind: 2,
}

function App() {
	const [game, setGame] = useState(createGame({buyIn: 100}))
	const [view] = useState<IGameView>({currentPlayer: game.players[0].id})

	const phase = game2phase(game)
	const roles = player2roles(game, view.currentPlayer)

	return (
		<div className="table" data-type="poker-table">
			<b>Phrase: {phase}</b>
			<ul>
				{game.players.map((player, i) => {
					const name = `Player ${i + 1}`
					const roles = player2roles(game, player.id)
					const displayedRoles = roles.length ? ` (${roles.join()})` : ''

					return (
						<li
							key={player.id}
							current-player={(view.currentPlayer === player.id) + ''}
						>
							{name}
							{displayedRoles}: {config.currency.symbol}
							{player.chips}
						</li>
					)
				})}
			</ul>
			Community Cards:{' '}
			{game.communityCards
				.map(card => card2rank(card) + CARD_SUIT_ICONS[card2suit(card)])
				.join(', ')}
			<br />
			Deck:
			{game.deck.map(card => card2rank(card) + CARD_SUIT_ICONS[card2suit(card)]).join(', ')}
			<br />
			Muck Deck:
			<br />
			{/* {phase === 'SETUP' &&
				!game.blinds.big &&
				(roles.includes('Big Blind') ? <SetBigBlind chipsAvailable={} /> : <button>AI Turn</button>)} */}
		</div>
	)
}

const SetBigBlind = () => {
	return (
		<>
			{config.currency.symbol}
			<input type="number" min={config.minBigBlind} />
			<button>Set Big Blind</button>
		</>
	)
}

/** simple: https://www.youtube.com/watch?v=ep1riICX-KU	adv: https://www.youtube.com/watch?v=DUzoLS4tnUM
 * PHASES
 * * Setup
 *		* roles dealer (goes last), small blind (left of dealer--must buy in regardless of desire to participate in the round), big blind (left of small blind)
 * 		* big blind bets and small blind puts down half (rounded down if it was odd)
 * * Shuffle
 *   * player to the dealer's right cuts the cards (stack deck opportunity with slight of hand)
 *   * dealer passes cards to the left (clockwise)
 *   * cards in hand are called hole cards
 * * Pre-Flop
 *   * Player to the right of the big blind (aka under the gun--look up the origin of that phrase for story mode), may call (wagering the current bid--as set by the big blind) OR raise (wager any amount over the big blind) OR they may fold (pay no chips and resign from the round)
 *   * (each new raise triggers another full round of player actions)
 *   * a side pot can be created if a player goes all in and the others want to keep playing but not raise that much. The all in player plays against everyone for the main pot, but is excluded from the sidepot as all other players still in will compete over that.
 *   * at the end of the preflop, the dealer pushes all chips into the center
 * * Flop
 *   * player to the left of the dealer goes first from now on
 *   * discard top card to the muck deck (to diencentives cheating and ensure that one one saw the top card that was going to be played)
 *   * three faceup community cards
 *   * another betting round staring to the left of the dealer
 * * Turn
 * 		* another card is revealed and more betting ensues (each new raise triggers another full round of player actions)
 * * River
 *   * Final card is flipped
 *   * betting round
 *   * if two or more players remain, a showdown beings
 * * Showdown
 *   * the best 5 cards from a combination of community cards and a player's hole cards are used (note: a player may use only the community cards--which is called "Playing the Board")
 *   * Multiple players playing the board will have winnings split amongst them if they win
 *   * if the winners have a combination of the same rank (i.e., flush, straight, etc.), then they go by the highest card (that they contributed?)
 *   * winner gets all the chips
 * * All roles are rotated for the next round (opening up dealer cheating opportunities, such as slipping another player a bad card)
 */
// phases: shuffle, setup, blinds(ante), deal(bets), pre-flop(bets), flop(bets), turn(bets), river(bets), showdown(unless all but one player folds), win chips

// poker highest ranks: royal flush (A-10 of same suit), straight flush (5 cards of the same suit/sequence), 4 of a kind (4 cards of the same rank--i.e., kings), full house (3 of a kind and one pair), flush (5 cards of the same suit), straight(5 consequtive cards in various suits), 3 of a kind (3 cards of the same rank), two pair (two pairs of different ranks), one pair (two cards of the same rank), high card (no combination can be made, the player with the highest ranking card in hand wins)
// optional deadman's hand

// buy in (spanish dabloons)
// roles dealer (goes last), small blind (left of dealer--must buy in regardless of desire to participate in the round), big blind (left of small blind)
// * small must put up half of the big blind (other players put in money once the cards have been dealt)

/* 
Single Player Poker Game Feature Network
This network graph visualizes the key features required for a single-player poker game, showing the interconnectedness of core game logic, user interface, AI, and player management.

1. Core Game Logic (Foundation)

Deals cards to the player, AI opponents, and the community board.

Hand Evaluation Engine:

Takes a player's hand and community cards as input.

Determines the highest-ranking poker hand (e.g., Royal Flush, Straight Flush, Four of a Kind, etc.).

Compares the player's hand against each AI opponent's hand to determine the winner.

Betting & Pot Management:

Manages the current pot size.

Tracks the state of betting rounds (pre-flop, flop, turn, river).

Calculates and updates the pot based on bets, calls, and raises.

Handles blind bets (Small Blind, Big Blind).

Game State & Flow Controller:

Maintains the state of the game (e.g., IN_PROGRESS, GAME_OVER).

Manages the turn order for each action.

Transitions the game from one round to the next (e.g., Pre-flop to Flop).

2. Player and Opponent Management
Player Profile:

Tracks the player's total bankroll.

Stores and updates player statistics (e.g., hands played, wins, losses).

AI Opponent System:

AI Logic: A sub-network that connects to the Core Game Logic.

Utilizes the Hand Evaluation Engine to inform its decisions.

Determines actions (Fold, Check, Call, Raise) based on programmed strategy and perceived hand strength.

Manages the AI's virtual bankroll and stats.

3. User Interface (UI)
Table & Card Display:

Visually represents the poker table.

Displays community cards (the Flop, Turn, and River).

Shows the player's hand (hole cards).

Displays the pot size and blinds.

Action Panel:

Provides interactive buttons for player actions: Fold, Check/Call, and Raise.

Includes a slider or input field for the raise amount.

Heads-Up Display (HUD):

Shows real-time player bankroll and stats.

May show AI opponent stats (optional, for advanced games).

4. Game Settings & Persistence
Customization Options:

Allows the player to adjust game rules (e.g., table limit, blinds).

Enables customization of the table theme or card back.

Save/Load Functionality:

Persists the game state to storage.

Allows the player to resume a game from where they left off.
 */

export default App
