import readline from 'readline';

/**
 * Handles user interface for the Sea Battle game
 */
export class GameUI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Get input from the player
   * @param {string} prompt - Prompt to display
   * @returns {Promise<string>} User input
   */
  getPlayerInput(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Display the current game state with both boards
   * @param {Board} opponentBoard - CPU's board (hidden ships)
   * @param {Board} playerBoard - Player's board (visible ships)
   */
  displayGameState(opponentBoard, playerBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Header row
    let header = '  ';
    for (let i = 0; i < opponentBoard.size; i++) {
      header += `${i} `;
    }
    console.log(header + '     ' + header);
    
    // Board rows
    for (let row = 0; row < opponentBoard.size; row++) {
      let rowStr = `${row} `;
      
      // Opponent board (hide ships)
      for (let col = 0; col < opponentBoard.size; col++) {
        const cell = opponentBoard.grid[row][col];
        // Hide ships on opponent board, show only hits and misses
        const displayCell = (cell === 'S') ? '~' : cell;
        rowStr += `${displayCell} `;
      }
      
      rowStr += `    ${row} `;
      
      // Player board (show everything)
      for (let col = 0; col < playerBoard.size; col++) {
        rowStr += `${playerBoard.grid[row][col]} `;
      }
      
      console.log(rowStr);
    }
    
    console.log();
  }

  /**
   * Display a single board
   * @param {Board} board - Board to display
   * @param {string} title - Title for the board
   * @param {boolean} hideShips - Whether to hide ships
   */
  displayBoard(board, title = 'Board', hideShips = false) {
    console.log(`\n--- ${title} ---`);
    
    // Header
    let header = '  ';
    for (let i = 0; i < board.size; i++) {
      header += `${i} `;
    }
    console.log(header);
    
    // Rows
    for (let row = 0; row < board.size; row++) {
      let rowStr = `${row} `;
      for (let col = 0; col < board.size; col++) {
        let cell = board.grid[row][col];
        if (hideShips && cell === 'S') {
          cell = '~';
        }
        rowStr += `${cell} `;
      }
      console.log(rowStr);
    }
    console.log();
  }

  /**
   * Display game statistics
   * @param {Object} stats - Game statistics object
   */
  displayStats(stats) {
    console.log('\n--- Game Statistics ---');
    console.log(`Game State: ${stats.gameState}`);
    console.log(`Current Turn: ${stats.currentTurn}`);
    console.log(`Human Ships Remaining: ${stats.humanShipsRemaining}`);
    console.log(`CPU Ships Remaining: ${stats.cpuShipsRemaining}`);
    console.log(`Human Guesses Made: ${stats.humanGuesses}`);
    console.log(`CPU Guesses Made: ${stats.cpuGuesses}`);
    console.log(`CPU Mode: ${stats.cpuMode}`);
    if (stats.cpuTargetQueueSize > 0) {
      console.log(`CPU Target Queue Size: ${stats.cpuTargetQueueSize}`);
    }
    console.log();
  }

  /**
   * Display help information
   */
  displayHelp() {
    console.log('\n--- Sea Battle Help ---');
    console.log('• Enter coordinates as two digits (e.g., 00, 34, 98)');
    console.log('• First digit is row (0-9), second digit is column (0-9)');
    console.log('• ~ = Water, S = Your Ship, X = Hit, O = Miss');
    console.log('• Sink all enemy ships to win!');
    console.log();
  }

  /**
   * Display welcome message
   */
  displayWelcome() {
    console.log('\n=================================');
    console.log('    Welcome to Sea Battle!');
    console.log('=================================');
    console.log('Find and sink all enemy battleships to win!');
  }

  /**
   * Close the UI interface
   */
  close() {
    this.rl.close();
  }
} 