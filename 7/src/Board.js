import { Ship } from './Ship.js';

/**
 * Represents a game board in Sea Battle
 */
export class Board {
  static BOARD_SIZE = 10;
  static WATER = '~';
  static SHIP = 'S';
  static HIT = 'X';
  static MISS = 'O';

  /**
   * Create a board
   * @param {boolean} showShips - Whether to show ships on the board display
   */
  constructor(showShips = false) {
    this.size = Board.BOARD_SIZE;
    this.showShips = showShips;
    this.grid = this.createEmptyGrid();
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Create an empty grid filled with water
   * @returns {Array<Array<string>>} Empty grid
   */
  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill(Board.WATER)
    );
  }

  /**
   * Check if coordinates are valid
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if coordinates are valid
   */
  isValidCoordinate(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  /**
   * Convert location string to coordinates
   * @param {string} location - Location string (e.g., '34')
   * @returns {{row: number, col: number}} Coordinates object
   */
  parseLocation(location) {
    if (typeof location !== 'string' || location.length !== 2) {
      throw new Error('Location must be a 2-character string');
    }
    const row = parseInt(location[0]);
    const col = parseInt(location[1]);
    
    if (!this.isValidCoordinate(row, col)) {
      throw new Error('Invalid coordinates');
    }
    
    return { row, col };
  }

  /**
   * Convert coordinates to location string
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {string} Location string
   */
  coordinatesToLocation(row, col) {
    return `${row}${col}`;
  }

  /**
   * Place a ship on the board
   * @param {number} length - Length of the ship
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @returns {Ship|null} The placed ship or null if placement failed
   */
  placeShip(length, startRow, startCol, orientation) {
    const locations = [];
    
    // Calculate all positions the ship would occupy
    for (let i = 0; i < length; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      
      if (!this.isValidCoordinate(row, col)) {
        return null; // Ship doesn't fit
      }
      
      if (this.grid[row][col] !== Board.WATER) {
        return null; // Position occupied
      }
      
      locations.push(this.coordinatesToLocation(row, col));
    }
    
    // Create and place the ship
    const ship = new Ship(length, locations);
    this.ships.push(ship);
    
    // Mark ship positions on grid if showing ships
    if (this.showShips) {
      locations.forEach(location => {
        const { row, col } = this.parseLocation(location);
        this.grid[row][col] = Board.SHIP;
      });
    }
    
    return ship;
  }

  /**
   * Place ships randomly on the board
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @returns {boolean} True if all ships were placed successfully
   */
  placeShipsRandomly(numShips, shipLength) {
    let placed = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (placed < numShips && attempts < maxAttempts) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const maxRow = orientation === 'horizontal' ? this.size : this.size - shipLength + 1;
      const maxCol = orientation === 'vertical' ? this.size : this.size - shipLength + 1;
      
      const startRow = Math.floor(Math.random() * maxRow);
      const startCol = Math.floor(Math.random() * maxCol);
      
      if (this.placeShip(shipLength, startRow, startCol, orientation)) {
        placed++;
      }
      attempts++;
    }
    
    return placed === numShips;
  }

  /**
   * Process a guess at the given location
   * @param {string} location - Location to guess (e.g., '34')
   * @returns {{hit: boolean, sunk: boolean, alreadyGuessed: boolean}} Result of the guess
   */
  processGuess(location) {
    if (this.guesses.has(location)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }
    
    this.guesses.add(location);
    const { row, col } = this.parseLocation(location);
    
    // Check if any ship is hit
    for (const ship of this.ships) {
      if (ship.isAtLocation(location)) {
        ship.hit(location);
        this.grid[row][col] = Board.HIT;
        return { hit: true, sunk: ship.isSunk(), alreadyGuessed: false };
      }
    }
    
    // Miss
    this.grid[row][col] = Board.MISS;
    return { hit: false, sunk: false, alreadyGuessed: false };
  }

  /**
   * Get the number of ships remaining (not sunk)
   * @returns {number} Number of ships not sunk
   */
  getShipsRemaining() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Get all valid adjacent locations to a given location
   * @param {string} location - Center location
   * @returns {Array<string>} Array of valid adjacent locations
   */
  getAdjacentLocations(location) {
    const { row, col } = this.parseLocation(location);
    const adjacent = [];
    
    const directions = [
      { row: -1, col: 0 },  // up
      { row: 1, col: 0 },   // down
      { row: 0, col: -1 },  // left
      { row: 0, col: 1 }    // right
    ];
    
    for (const dir of directions) {
      const newRow = row + dir.row;
      const newCol = col + dir.col;
      
      if (this.isValidCoordinate(newRow, newCol)) {
        adjacent.push(this.coordinatesToLocation(newRow, newCol));
      }
    }
    
    return adjacent;
  }

  /**
   * Get a string representation of the board
   * @returns {string} Board as a formatted string
   */
  toString() {
    let result = '  ';
    
    // Header row
    for (let i = 0; i < this.size; i++) {
      result += `${i} `;
    }
    result += '\n';
    
    // Board rows
    for (let row = 0; row < this.size; row++) {
      result += `${row} `;
      for (let col = 0; col < this.size; col++) {
        result += `${this.grid[row][col]} `;
      }
      result += '\n';
    }
    
    return result;
  }
} 