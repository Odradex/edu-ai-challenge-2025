import { Game } from '../src/Game.js';

// Mock the GameUI to avoid readline interactions in tests
jest.mock('../src/GameUI.js', () => {
  return {
    GameUI: jest.fn().mockImplementation(() => ({
      getPlayerInput: jest.fn(),
      displayGameState: jest.fn(),
      close: jest.fn()
    }))
  };
});

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game();
  });

  describe('constructor', () => {
    test('should create game with default settings', () => {
      expect(game.boardSize).toBe(10);
      expect(game.numShips).toBe(3);
      expect(game.shipLength).toBe(3);
      expect(game.gameState).toBe('setup');
      expect(game.winner).toBeNull();
      expect(game.currentTurn).toBe('human');
    });

    test('should create game with custom options', () => {
      const customGame = new Game({
        boardSize: 8,
        numShips: 2,
        shipLength: 4
      });
      expect(customGame.boardSize).toBe(8);
      expect(customGame.numShips).toBe(2);
      expect(customGame.shipLength).toBe(4);
    });
  });

  describe('initialize', () => {
    test('should initialize game successfully', async () => {
      const result = await game.initialize();
      expect(result).toBe(true);
      expect(game.gameState).toBe('playing');
      expect(game.humanPlayer.board.ships).toHaveLength(3);
      expect(game.cpuPlayer.board.ships).toHaveLength(3);
    });

    test('should handle initialization failure', async () => {
      // Mock ship placement to fail
      jest.spyOn(game.humanPlayer, 'setupShips').mockReturnValue(false);
      
      const result = await game.initialize();
      expect(result).toBe(false);
      expect(game.gameState).toBe('setup');
    });
  });

  describe('checkGameEnd', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should detect human victory', () => {
      // Mock CPU with no ships remaining
      jest.spyOn(game.cpuPlayer, 'getShipsRemaining').mockReturnValue(0);
      
      game.checkGameEnd();
      expect(game.gameState).toBe('finished');
      expect(game.winner).toBe('human');
    });

    test('should detect CPU victory', () => {
      // Mock human with no ships remaining
      jest.spyOn(game.humanPlayer, 'getShipsRemaining').mockReturnValue(0);
      
      game.checkGameEnd();
      expect(game.gameState).toBe('finished');
      expect(game.winner).toBe('cpu');
    });

    test('should continue game when both have ships', () => {
      jest.spyOn(game.humanPlayer, 'getShipsRemaining').mockReturnValue(2);
      jest.spyOn(game.cpuPlayer, 'getShipsRemaining').mockReturnValue(2);
      
      game.checkGameEnd();
      expect(game.gameState).toBe('playing');
      expect(game.winner).toBeNull();
    });
  });

  describe('getGameStats', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should return correct game statistics', () => {
      const stats = game.getGameStats();
      expect(stats).toHaveProperty('gameState');
      expect(stats).toHaveProperty('winner');
      expect(stats).toHaveProperty('currentTurn');
      expect(stats).toHaveProperty('humanShipsRemaining');
      expect(stats).toHaveProperty('cpuShipsRemaining');
      expect(stats).toHaveProperty('humanGuesses');
      expect(stats).toHaveProperty('cpuGuesses');
      expect(stats).toHaveProperty('cpuMode');
      expect(stats).toHaveProperty('cpuTargetQueueSize');
    });

    test('should return accurate ship counts', () => {
      const stats = game.getGameStats();
      expect(stats.humanShipsRemaining).toBe(3);
      expect(stats.cpuShipsRemaining).toBe(3);
    });
  });

  describe('handleCPUTurn', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    test('should process CPU turn correctly', async () => {
      const originalTurn = game.currentTurn;
      game.currentTurn = 'cpu';
      
      await game.handleCPUTurn();
      
      // Should switch back to human turn
      expect(game.currentTurn).toBe('human');
    });

    test('should handle CPU turn errors gracefully', async () => {
      game.currentTurn = 'cpu';
      jest.spyOn(game.cpuPlayer, 'makeGuess').mockImplementation(() => {
        throw new Error('Test error');
      });
      
      await game.handleCPUTurn();
      
      // Should still switch to human turn even on error
      expect(game.currentTurn).toBe('human');
    });
  });

  describe('handleHumanTurn', () => {
    beforeEach(async () => {
      await game.initialize();
      // Mock UI input
      game.ui.getPlayerInput = jest.fn().mockResolvedValue('34');
    });

    test('should process valid human guess', async () => {
      game.currentTurn = 'human';
      
      await game.handleHumanTurn();
      
      expect(game.currentTurn).toBe('cpu');
    });

    test('should handle invalid human input', async () => {
      game.currentTurn = 'human';
      game.ui.getPlayerInput = jest.fn().mockResolvedValue('invalid');
      
      await game.handleHumanTurn();
      
      // Should stay on human turn for invalid input
      expect(game.currentTurn).toBe('human');
    });

    test('should handle already guessed location', async () => {
      game.currentTurn = 'human';
      // First guess
      await game.handleHumanTurn();
      
      // Reset turn and try same location
      game.currentTurn = 'human';
      await game.handleHumanTurn();
      
      // Should stay on human turn for repeat guess
      expect(game.currentTurn).toBe('human');
    });
  });
}); 