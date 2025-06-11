import { Board } from './Board.js';

/**
 * Base Player class
 */
export class Player {
  constructor(name, isHuman = true) {
    this.name = name;
    this.isHuman = isHuman;
    this.board = new Board(isHuman); // Show ships on human player's board
  }

  /**
   * Set up the player's ships
   * @param {number} numShips - Number of ships
   * @param {number} shipLength - Length of each ship
   * @returns {boolean} True if setup was successful
   */
  setupShips(numShips, shipLength) {
    return this.board.placeShipsRandomly(numShips, shipLength);
  }

  /**
   * Get the number of ships remaining
   * @returns {number} Ships remaining
   */
  getShipsRemaining() {
    return this.board.getShipsRemaining();
  }

  /**
   * Process an opponent's guess against this player's board
   * @param {string} location - Location being guessed
   * @returns {Object} Result of the guess
   */
  receiveAttack(location) {
    return this.board.processGuess(location);
  }
}

/**
 * Human Player class
 */
export class HumanPlayer extends Player {
  constructor() {
    super('Player', true);
  }

  /**
   * Validate a human player's guess input
   * @param {string} input - Raw input from user
   * @returns {{valid: boolean, location?: string, error?: string}} Validation result
   */
  validateGuess(input) {
    if (!input || typeof input !== 'string') {
      return { valid: false, error: 'Input must be a string' };
    }

    const trimmed = input.trim();
    if (trimmed.length !== 2) {
      return { valid: false, error: 'Input must be exactly two digits (e.g., 00, 34, 98)' };
    }

    const row = parseInt(trimmed[0]);
    const col = parseInt(trimmed[1]);

    if (isNaN(row) || isNaN(col)) {
      return { valid: false, error: 'Input must contain only digits' };
    }

    if (!this.board.isValidCoordinate(row, col)) {
      return { 
        valid: false, 
        error: `Coordinates must be between 0 and ${Board.BOARD_SIZE - 1}` 
      };
    }

    return { valid: true, location: trimmed };
  }
}

/**
 * CPU Player class with hunt and target modes
 */
export class CPUPlayer extends Player {
  constructor() {
    super('CPU', false);
    this.mode = 'hunt';
    this.targetQueue = [];
    this.opponentBoard = null;
  }

  /**
   * Set reference to opponent's board for making guesses
   * @param {Board} board - Opponent's board
   */
  setOpponentBoard(board) {
    this.opponentBoard = board;
  }

  /**
   * Make a guess against the opponent
   * @returns {string} Location to guess
   */
  makeGuess() {
    if (!this.opponentBoard) {
      throw new Error('Opponent board not set');
    }

    let location;

    if (this.mode === 'target' && this.targetQueue.length > 0) {
      // Target mode: attack adjacent to previous hits
      location = this.targetQueue.shift();
      
      // If location was already guessed, try next in queue or switch to hunt
      while (this.opponentBoard.guesses.has(location) && this.targetQueue.length > 0) {
        location = this.targetQueue.shift();
      }
      
      if (this.opponentBoard.guesses.has(location)) {
        this.mode = 'hunt';
        return this.makeRandomGuess();
      }
    } else {
      // Hunt mode: make random guess
      this.mode = 'hunt';
      location = this.makeRandomGuess();
    }

    return location;
  }

  /**
   * Make a random guess that hasn't been made before
   * @returns {string} Random location
   */
  makeRandomGuess() {
    const maxAttempts = 200;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const row = Math.floor(Math.random() * Board.BOARD_SIZE);
      const col = Math.floor(Math.random() * Board.BOARD_SIZE);
      const location = this.opponentBoard.coordinatesToLocation(row, col);
      
      if (!this.opponentBoard.guesses.has(location)) {
        return location;
      }
      attempts++;
    }
    
    // Fallback: find first unguessed location
    for (let row = 0; row < Board.BOARD_SIZE; row++) {
      for (let col = 0; col < Board.BOARD_SIZE; col++) {
        const location = this.opponentBoard.coordinatesToLocation(row, col);
        if (!this.opponentBoard.guesses.has(location)) {
          return location;
        }
      }
    }
    
    throw new Error('No valid moves remaining');
  }

  /**
   * Process the result of a guess and update AI strategy
   * @param {string} location - Location that was guessed
   * @param {Object} result - Result of the guess {hit, sunk, alreadyGuessed}
   */
  processGuessResult(location, result) {
    if (result.hit && !result.sunk) {
      // Hit but not sunk: switch to target mode and add adjacent locations
      this.mode = 'target';
      const adjacent = this.opponentBoard.getAdjacentLocations(location);
      
      for (const adjLocation of adjacent) {
        if (!this.opponentBoard.guesses.has(adjLocation) && 
            !this.targetQueue.includes(adjLocation)) {
          this.targetQueue.push(adjLocation);
        }
      }
    } else if (result.sunk) {
      // Ship sunk: back to hunt mode
      this.mode = 'hunt';
      this.targetQueue = [];
    }
    // If miss, continue current mode
  }
} 