import { Game } from './Game.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  try {
    const game = new Game();
    await game.start();
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Start the game
main(); 