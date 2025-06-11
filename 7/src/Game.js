import { HumanPlayer, CPUPlayer } from './Player.js';
import { GameUI } from './GameUI.js';

/**
 * Main Game class that orchestrates the Sea Battle game
 */
export class Game {
  static DEFAULT_BOARD_SIZE = 10;
  static DEFAULT_NUM_SHIPS = 3;
  static DEFAULT_SHIP_LENGTH = 3;

  /**
   * Create a new game
   * @param {Object} options - Game configuration options
   */
  constructor(options = {}) {
    this.boardSize = options.boardSize || Game.DEFAULT_BOARD_SIZE;
    this.numShips = options.numShips || Game.DEFAULT_NUM_SHIPS;
    this.shipLength = options.shipLength || Game.DEFAULT_SHIP_LENGTH;
    
    this.humanPlayer = new HumanPlayer();
    this.cpuPlayer = new CPUPlayer();
    this.ui = new GameUI();
    
    this.gameState = 'setup'; // setup, playing, finished
    this.winner = null;
    this.currentTurn = 'human'; // human, cpu
  }

  /**
   * Initialize the game
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initialize() {
    try {
      console.log('Setting up Sea Battle game...');
      
      // Setup human player ships
      const humanSetup = this.humanPlayer.setupShips(this.numShips, this.shipLength);
      if (!humanSetup) {
        throw new Error('Failed to setup human player ships');
      }
      
      // Setup CPU ships
      const cpuSetup = this.cpuPlayer.setupShips(this.numShips, this.shipLength);
      if (!cpuSetup) {
        throw new Error('Failed to setup CPU ships');
      }
      
      // Set up CPU opponent reference
      this.cpuPlayer.setOpponentBoard(this.humanPlayer.board);
      
      this.gameState = 'playing';
      console.log(`\nGame initialized! Ships placed: ${this.numShips} ships of length ${this.shipLength}`);
      console.log("Let's play Sea Battle!");
      console.log(`Try to sink the ${this.numShips} enemy ships.`);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize game:', error.message);
      return false;
    }
  }

  /**
   * Start the main game loop
   * @returns {Promise<void>}
   */
  async start() {
    if (this.gameState !== 'playing') {
      const initialized = await this.initialize();
      if (!initialized) {
        return;
      }
    }

    while (this.gameState === 'playing') {
      // Display current game state
      this.ui.displayGameState(this.cpuPlayer.board, this.humanPlayer.board);
      
      if (this.currentTurn === 'human') {
        await this.handleHumanTurn();
      } else {
        await this.handleCPUTurn();
      }
      
      this.checkGameEnd();
    }
    
    this.displayGameEnd();
  }

  /**
   * Handle human player's turn
   * @returns {Promise<void>}
   */
  async handleHumanTurn() {
    try {
      const input = await this.ui.getPlayerInput('Enter your guess (e.g., 00): ');
      const validation = this.humanPlayer.validateGuess(input);
      
      if (!validation.valid) {
        console.log(`Error: ${validation.error}`);
        return; // Stay on human turn
      }
      
      // Check if already guessed
      if (this.cpuPlayer.board.guesses.has(validation.location)) {
        console.log('You already guessed that location!');
        return; // Stay on human turn
      }
      
      // Process the guess
      const result = this.cpuPlayer.receiveAttack(validation.location);
      
      if (result.hit) {
        console.log('PLAYER HIT!');
        if (result.sunk) {
          console.log('You sunk an enemy battleship!');
        }
      } else {
        console.log('PLAYER MISS.');
      }
      
      // Switch to CPU turn
      this.currentTurn = 'cpu';
      
    } catch (error) {
      console.error('Error during human turn:', error.message);
    }
  }

  /**
   * Handle CPU player's turn
   * @returns {Promise<void>}
   */
  async handleCPUTurn() {
    try {
      console.log("\n--- CPU's Turn ---");
      
      const location = this.cpuPlayer.makeGuess();
      const result = this.humanPlayer.receiveAttack(location);
      
      console.log(`CPU ${this.cpuPlayer.mode === 'target' ? 'targets' : 'guesses'}: ${location}`);
      
      if (result.hit) {
        console.log(`CPU HIT at ${location}!`);
        if (result.sunk) {
          console.log('CPU sunk your battleship!');
        }
      } else {
        console.log(`CPU MISS at ${location}.`);
      }
      
      // Update CPU AI strategy
      this.cpuPlayer.processGuessResult(location, result);
      
      // Switch to human turn
      this.currentTurn = 'human';
      
    } catch (error) {
      console.error('Error during CPU turn:', error.message);
      // Switch back to human turn to continue game
      this.currentTurn = 'human';
    }
  }

  /**
   * Check if the game has ended
   */
  checkGameEnd() {
    const humanShipsRemaining = this.humanPlayer.getShipsRemaining();
    const cpuShipsRemaining = this.cpuPlayer.getShipsRemaining();
    
    if (cpuShipsRemaining === 0) {
      this.gameState = 'finished';
      this.winner = 'human';
    } else if (humanShipsRemaining === 0) {
      this.gameState = 'finished';
      this.winner = 'cpu';
    }
  }

  /**
   * Display game end message
   */
  displayGameEnd() {
    this.ui.displayGameState(this.cpuPlayer.board, this.humanPlayer.board);
    
    if (this.winner === 'human') {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    } else if (this.winner === 'cpu') {
      console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    }
    
    this.ui.close();
  }

  /**
   * Get current game statistics
   * @returns {Object} Game statistics
   */
  getGameStats() {
    return {
      gameState: this.gameState,
      winner: this.winner,
      currentTurn: this.currentTurn,
      humanShipsRemaining: this.humanPlayer.getShipsRemaining(),
      cpuShipsRemaining: this.cpuPlayer.getShipsRemaining(),
      humanGuesses: this.cpuPlayer.board.guesses.size,
      cpuGuesses: this.humanPlayer.board.guesses.size,
      cpuMode: this.cpuPlayer.mode,
      cpuTargetQueueSize: this.cpuPlayer.targetQueue.length
    };
  }
} 